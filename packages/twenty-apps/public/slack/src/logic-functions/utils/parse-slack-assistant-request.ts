import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantEmptyRequest } from 'src/logic-functions/types/slack-assistant-empty-request.type';
import { type SlackAssistantRequestDraft } from 'src/logic-functions/types/slack-assistant-request-draft.type';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { getSlackAssistantParentMessageTimestamp } from 'src/logic-functions/utils/get-slack-assistant-parent-message-timestamp';
import { getSlackBotUserIdFromEventBody } from 'src/logic-functions/utils/get-slack-bot-user-id-from-event-body';
import { stripSlackBotMention } from 'src/logic-functions/utils/strip-slack-bot-mention';

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

const normalizeWhitespace = (text: string): string =>
  text.replace(/\s+/g, ' ').trim();

const getBotUserIdFromLeadingMention = (text: string): string | undefined =>
  text.trimStart().match(LEADING_MENTION_PATTERN)?.[1];

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

  const isMention = event.type === 'app_mention';
  const isDirectMessage =
    event.type === 'message' && event.channel_type === 'im';
  const isChannelOrGroupMessage =
    event.type === 'message' &&
    (event.channel_type === 'channel' || event.channel_type === 'group');
  const isThreadFollowUp =
    isChannelOrGroupMessage && isNonEmptyString(event.thread_ts);

  if (!isMention && !isDirectMessage && !isThreadFollowUp) {
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

  const rawText = event.text ?? '';
  const botUserId =
    getSlackBotUserIdFromEventBody(body) ??
    (isMention ? getBotUserIdFromLeadingMention(rawText) : undefined);

  const requestText = normalizeWhitespace(
    isNonEmptyString(botUserId)
      ? stripSlackBotMention({ text: rawText, botUserId })
      : rawText,
  );

  if (!isNonEmptyString(requestText)) {
    if (isMention || isDirectMessage) {
      return {
        request: null,
        skipReason: 'Empty request text',
        emptyRequest: {
          slackChannelId: event.channel,
          slackMessageTimestamp: event.ts,
          parentMessageTimestamp: getSlackAssistantParentMessageTimestamp({
            slackThreadTimestamp: event.thread_ts,
            slackMessageTimestamp: event.ts,
            isDirectMessage,
          }),
        },
      };
    }

    return { request: null, skipReason: 'Empty request text' };
  }

  const slackChannelType =
    event.channel_type ??
    (isMention ? 'channel' : isDirectMessage ? 'im' : 'channel');

  return {
    request: {
      slackEventId: body.event_id,
      slackChannelId: event.channel,
      slackChannelType,
      slackThreadTimestamp: event.thread_ts ?? '',
      slackMessageTimestamp: event.ts,
      slackUserId: event.user,
      requestText,
    },
    requiresActiveThreadSubscription: isThreadFollowUp && !isMention,
  };
};
