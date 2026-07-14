import { isNonEmptyString } from '@sniptt/guards';

import {
  type SlackAssistantRequestDraft,
  type SlackEventsRequestBody,
} from 'src/logic-functions/types/slack-event.type';

const BOT_MENTION_PATTERN = /<@[A-Z0-9]+(\|[^>]*)?>/g;

const stripBotMention = (text: string): string =>
  text.replace(BOT_MENTION_PATTERN, ' ').replace(/\s+/g, ' ').trim();

// Returns the assistant request carried by an Events API callback, or a skip
// reason when the event is not something the assistant should answer.
export const parseSlackAssistantRequest = (
  body: SlackEventsRequestBody,
):
  | { request: SlackAssistantRequestDraft }
  | { request: null; skipReason: string } => {
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

  if (!isMention && !isDirectMessage) {
    return { request: null, skipReason: `Unhandled event type: ${event.type}` };
  }

  // Message edits, joins, and other subtypes are not user requests; bot_id
  // filters out the assistant's own replies so it never answers itself.
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

  const requestText = stripBotMention(event.text ?? '');

  if (requestText.length === 0) {
    return { request: null, skipReason: 'Empty request text' };
  }

  return {
    request: {
      slackEventId: body.event_id,
      slackChannelId: event.channel,
      slackChannelType: event.channel_type ?? (isMention ? 'channel' : 'im'),
      slackThreadTimestamp: event.thread_ts ?? '',
      slackMessageTimestamp: event.ts,
      slackUserId: event.user,
      requestText,
    },
  };
};
