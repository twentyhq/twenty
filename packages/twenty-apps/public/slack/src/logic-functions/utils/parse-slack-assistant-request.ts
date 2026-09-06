import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantEmptyRequest } from 'src/logic-functions/types/slack-assistant-empty-request.type';
import { type SlackAssistantEventKind } from 'src/logic-functions/types/slack-assistant-event-classification.type';
import { type SlackAssistantRequestDraft } from 'src/logic-functions/types/slack-assistant-request-draft.type';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { classifySlackAssistantEventBody } from 'src/logic-functions/utils/classify-slack-assistant-event-body';
import { getSlackAssistantParentMessageTimestamp } from 'src/logic-functions/utils/get-slack-assistant-parent-message-timestamp';
import { getSlackBotUserIdFromEventBody } from 'src/logic-functions/utils/get-slack-bot-user-id-from-event-body';
import { normalizeSlackRequestText } from 'src/logic-functions/utils/normalize-slack-request-text';

const LEADING_MENTION_PATTERN = /^<@([A-Z0-9]+)(\|[^>]*)?>/;

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
  const classification = classifySlackAssistantEventBody(body);

  if (classification.kind === null) {
    return { request: null, skipReason: classification.skipReason };
  }

  const kind = classification.kind;
  const event = body.event;

  if (
    !event ||
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
