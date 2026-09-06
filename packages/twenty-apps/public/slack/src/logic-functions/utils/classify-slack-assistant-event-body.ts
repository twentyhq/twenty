import { isNonEmptyString } from '@sniptt/guards';

import {
  type SlackAssistantEventClassification,
  type SlackAssistantEventKind,
} from 'src/logic-functions/types/slack-assistant-event-classification.type';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

type SlackInboundEvent = NonNullable<SlackEventsRequestBody['event']>;

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

// Decides from the event body alone, with no workspace state, so the events
// resolver can answer Slack without dispatching a second billed invocation
// into the target workspace for an event the enqueue would only discard.
export const classifySlackAssistantEventBody = (
  body: SlackEventsRequestBody,
): SlackAssistantEventClassification => {
  if (body.type !== 'event_callback') {
    return { kind: null, skipReason: `Unhandled body type: ${body.type}` };
  }

  const event = body.event;

  if (!event) {
    return { kind: null, skipReason: 'Missing event payload' };
  }

  const kind = classifySlackAssistantEvent(event);

  if (kind === null) {
    return { kind: null, skipReason: `Unhandled event type: ${event.type}` };
  }

  if (isNonEmptyString(event.bot_id) || isNonEmptyString(event.subtype)) {
    return { kind: null, skipReason: 'Not a plain user message' };
  }

  return { kind };
};
