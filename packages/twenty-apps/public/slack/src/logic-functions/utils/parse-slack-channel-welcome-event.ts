import { isNonEmptyString } from '@sniptt/guards';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

type ParsedSlackChannelWelcomeEvent =
  | { join: { slackChannelId: string; slackUserId: string } }
  | { join: null; skipReason: string };

export const parseSlackChannelWelcomeEvent = (
  body: SlackEventsRequestBody,
): ParsedSlackChannelWelcomeEvent => {
  if (body.type !== 'event_callback') {
    return { join: null, skipReason: `Unhandled body type: ${body.type}` };
  }

  const event = body.event;

  if (!event) {
    return { join: null, skipReason: 'Missing event payload' };
  }

  if (event.type !== 'member_joined_channel') {
    return { join: null, skipReason: `Unhandled event type: ${event.type}` };
  }

  if (!isNonEmptyString(event.channel) || !isNonEmptyString(event.user)) {
    return { join: null, skipReason: 'Event is missing required fields' };
  }

  return {
    join: { slackChannelId: event.channel, slackUserId: event.user },
  };
};
