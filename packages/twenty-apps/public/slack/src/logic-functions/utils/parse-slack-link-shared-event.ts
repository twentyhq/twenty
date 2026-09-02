import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

type ParsedSlackLinkSharedEvent =
  | {
      linkShared: {
        slackChannelId: string;
        messageTimestamp: string;
        slackUserId: string;
        urls: string[];
      };
    }
  | { linkShared: null; skipReason: string };

export const parseSlackLinkSharedEvent = (
  body: SlackEventsRequestBody,
): ParsedSlackLinkSharedEvent => {
  if (body.type !== 'event_callback') {
    return {
      linkShared: null,
      skipReason: `Unhandled body type: ${body.type}`,
    };
  }

  const event = body.event;

  if (!isDefined(event)) {
    return { linkShared: null, skipReason: 'Missing event payload' };
  }

  if (event.type !== 'link_shared') {
    return {
      linkShared: null,
      skipReason: `Unhandled event type: ${event.type}`,
    };
  }

  if (
    !isNonEmptyString(event.channel) ||
    !isNonEmptyString(event.message_ts) ||
    !isNonEmptyString(event.user)
  ) {
    return {
      linkShared: null,
      skipReason: 'Event is missing required fields',
    };
  }

  const urls = (Array.isArray(event.links) ? event.links : [])
    .map((link) => asRecord(link)?.url)
    .filter(isNonEmptyString);

  if (urls.length === 0) {
    return { linkShared: null, skipReason: 'Event carries no link URLs' };
  }

  return {
    linkShared: {
      slackChannelId: event.channel,
      messageTimestamp: event.message_ts,
      slackUserId: event.user,
      urls,
    },
  };
};
