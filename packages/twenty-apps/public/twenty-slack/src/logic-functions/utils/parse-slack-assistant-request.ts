import { isNonEmptyString } from '@sniptt/guards';

import {
  type ParsedSlackAssistantRequest,
  type SlackEventsRequestBody,
} from 'src/logic-functions/types/slack-event.type';

const LEADING_BOT_MENTION_PATTERN = /^<@[A-Z0-9]+(\|[^>]*)?>\s*/;

const stripLeadingBotMention = (text: string): string =>
  text.replace(LEADING_BOT_MENTION_PATTERN, '').replace(/\s+/g, ' ').trim();

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
  const requestText = isMention
    ? stripLeadingBotMention(rawText)
    : rawText.replace(/\s+/g, ' ').trim();

  if (requestText.length === 0) {
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
