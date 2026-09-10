import { isNonEmptyString } from '@sniptt/guards';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

type ParsedSlackChannelWelcomeEvent =
  | { channelJoin: { slackChannelId: string; slackUserId: string } }
  | { channelJoin: null; skipReason: string };

export const parseSlackChannelWelcomeEvent = (
  body: SlackEventsRequestBody,
): ParsedSlackChannelWelcomeEvent => {
  if (body.type !== 'event_callback') {
    return {
      channelJoin: null,
      skipReason: `Unhandled body type: ${body.type}`,
    };
  }

  const event = body.event;

  if (!event) {
    return { channelJoin: null, skipReason: 'Missing event payload' };
  }

  if (event.type !== 'member_joined_channel') {
    return {
      channelJoin: null,
      skipReason: `Unhandled event type: ${event.type}`,
    };
  }

  if (!isNonEmptyString(event.channel) || !isNonEmptyString(event.user)) {
    return {
      channelJoin: null,
      skipReason: 'Event is missing required fields',
    };
  }

  return {
    channelJoin: { slackChannelId: event.channel, slackUserId: event.user },
  };
};
