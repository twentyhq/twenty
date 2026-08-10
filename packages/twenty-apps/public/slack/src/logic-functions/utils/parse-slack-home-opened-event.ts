import { isNonEmptyString } from '@sniptt/guards';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

type ParsedSlackHomeOpenedEvent =
  | { homeOpened: { slackChannelId: string; slackUserId: string } }
  | { homeOpened: null; skipReason: string };

export const parseSlackHomeOpenedEvent = (
  body: SlackEventsRequestBody,
): ParsedSlackHomeOpenedEvent => {
  if (body.type !== 'event_callback') {
    return {
      homeOpened: null,
      skipReason: `Unhandled body type: ${body.type}`,
    };
  }

  const event = body.event;

  if (!event) {
    return { homeOpened: null, skipReason: 'Missing event payload' };
  }

  if (event.type !== 'app_home_opened') {
    return {
      homeOpened: null,
      skipReason: `Unhandled event type: ${event.type}`,
    };
  }

  if (event.tab !== 'messages') {
    return {
      homeOpened: null,
      skipReason: `Unhandled app home tab: ${event.tab}`,
    };
  }

  if (!isNonEmptyString(event.channel) || !isNonEmptyString(event.user)) {
    return {
      homeOpened: null,
      skipReason: 'Event is missing required fields',
    };
  }

  return {
    homeOpened: { slackChannelId: event.channel, slackUserId: event.user },
  };
};
