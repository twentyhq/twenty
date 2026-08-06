import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantEmptyRequest } from 'src/logic-functions/types/slack-assistant-empty-request.type';
import { type SlackAssistantRequestDraft } from 'src/logic-functions/types/slack-assistant-request-draft.type';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { getSlackAssistantParentMessageTimestamp } from 'src/logic-functions/utils/get-slack-assistant-parent-message-timestamp';

const LEADING_BOT_MENTION_PATTERN = /^<@[A-Z0-9]+(\|[^>]*)?>\s*/;

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

const stripLeadingBotMention = (text: string): string =>
  text.replace(LEADING_BOT_MENTION_PATTERN, '').replace(/\s+/g, ' ').trim();

const normalizeSlackRequestText = (
  text: string,
  kind: SlackAssistantEventKind,
): string =>
  kind === 'mention'
    ? stripLeadingBotMention(text)
    : text.replace(/\s+/g, ' ').trim();

const buildSlackAssistantEmptyRequest = ({
  slackChannelId,
  slackMessageTimestamp,
  slackThreadTimestamp,
  isDirectMessage,
}: {
  slackChannelId: string;
  slackMessageTimestamp: string;
  slackThreadTimestamp: string | undefined;
  isDirectMessage: boolean;
}): SlackAssistantEmptyRequest => ({
  slackChannelId,
  slackMessageTimestamp,
  parentMessageTimestamp: getSlackAssistantParentMessageTimestamp({
    slackThreadTimestamp,
    slackMessageTimestamp,
    isDirectMessage,
  }),
  isInExistingThread: isNonEmptyString(slackThreadTimestamp),
});

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

  const requestText = normalizeSlackRequestText(event.text ?? '', kind);

  if (!isNonEmptyString(requestText)) {
    if (kind === 'threadFollowUp') {
      return { request: null, skipReason: 'Empty request text' };
    }

    return {
      request: null,
      skipReason: 'Empty request text',
      emptyRequest: buildSlackAssistantEmptyRequest({
        slackChannelId: event.channel,
        slackMessageTimestamp: event.ts,
        slackThreadTimestamp: event.thread_ts,
        isDirectMessage: kind === 'directMessage',
      }),
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
