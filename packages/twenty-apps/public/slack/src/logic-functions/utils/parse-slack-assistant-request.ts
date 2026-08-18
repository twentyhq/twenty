import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantEmptyRequest } from 'src/logic-functions/types/slack-assistant-empty-request.type';
import { type SlackAssistantRequestDraft } from 'src/logic-functions/types/slack-assistant-request-draft.type';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { getSlackAssistantParentMessageTimestamp } from 'src/logic-functions/utils/get-slack-assistant-parent-message-timestamp';
import { getSlackBotUserIdFromEventBody } from 'src/logic-functions/utils/get-slack-bot-user-id-from-event-body';
import { normalizeSlackRequestText } from 'src/logic-functions/utils/normalize-slack-request-text';

const LEADING_MENTION_PATTERN = /^<@([A-Z0-9]+)(\|[^>]*)?>/;

type SlackInboundEvent = NonNullable<SlackEventsRequestBody['event']>;

type SlackAssistantEventKind = 'mention' | 'directMessage' | 'threadFollowUp';

type ParsedSlackAssistantRequest =
  | {
      request: SlackAssistantRequestDraft;
      requiresActiveThreadSubscription: boolean;
    }
  | {
      request: null;
      skipReason: string;
      emptyRequest?: SlackAssistantEmptyRequest;
    };

const classifySlackAssistantEvent = (
  event: SlackInboundEvent,
): SlackAssistantEventKind | null => {
  if (event.type === 'app_mention') {
    return 'mention';
  }

  if (event.type !== 'message') {
    return null;
  }

  if (event.channel_type === 'im') {
    return 'directMessage';
  }

  const isChannelOrGroupMessage =
    event.channel_type === 'channel' || event.channel_type === 'group';

  if (isChannelOrGroupMessage && isNonEmptyString(event.thread_ts)) {
    return 'threadFollowUp';
  }

  return null;
};

const getBotUserIdFromLeadingMention = (text: string): string | undefined =>
  text.trimStart().match(LEADING_MENTION_PATTERN)?.[1];

const resolveRequestBotUserId = ({
  text,
  kind,
  botUserId,
}: {
  text: string;
  kind: SlackAssistantEventKind;
  botUserId: string | undefined;
}): string | undefined =>
  botUserId ??
  (kind === 'mention' ? getBotUserIdFromLeadingMention(text) : undefined);

export const parseSlackAssistantRequest = (
  body: SlackEventsRequestBody,
): ParsedSlackAssistantRequest => {
  if (body.type !== 'event_callback') {
    return { request: null, skipReason: `Unhandled body type: ${body.type}` };
  }

  const event = body.event;

  if (!event) {
    return { request: null, skipReason: 'Missing event payload' };
  }

  const kind = classifySlackAssistantEvent(event);

  if (kind === null) {
    return { request: null, skipReason: `Unhandled event type: ${event.type}` };
  }

  if (isNonEmptyString(event.bot_id) || isNonEmptyString(event.subtype)) {
    return { request: null, skipReason: 'Not a plain user message' };
  }

  if (
    !isNonEmptyString(body.event_id) ||
    !isNonEmptyString(event.channel) ||
    !isNonEmptyString(event.ts) ||
    !isNonEmptyString(event.user)
  ) {
    return { request: null, skipReason: 'Event is missing required fields' };
  }

  const requestText = normalizeSlackRequestText({
    text: event.text ?? '',
    botUserId: resolveRequestBotUserId({
      text: event.text ?? '',
      kind,
      botUserId: getSlackBotUserIdFromEventBody(body),
    }),
  });

  if (!isNonEmptyString(requestText)) {
    if (kind === 'threadFollowUp') {
      return { request: null, skipReason: 'Empty request text' };
    }

    return {
      request: null,
      skipReason: 'Empty request text',
      emptyRequest: {
        slackChannelId: event.channel,
        slackMessageTimestamp: event.ts,
        parentMessageTimestamp: getSlackAssistantParentMessageTimestamp({
          slackThreadTimestamp: event.thread_ts,
          slackMessageTimestamp: event.ts,
        }),
        isInExistingThread: isNonEmptyString(event.thread_ts),
      },
    };
  }

  return {
    request: {
      slackEventId: body.event_id,
      slackChannelId: event.channel,
      slackChannelType: event.channel_type ?? 'channel',
      slackThreadTimestamp: event.thread_ts ?? '',
      slackMessageTimestamp: event.ts,
      slackUserId: event.user,
      requestText,
    },
    requiresActiveThreadSubscription: kind === 'threadFollowUp',
  };
};
