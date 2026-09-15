import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

type SlackInboundEvent = NonNullable<SlackEventsRequestBody['event']>;

type SlackUnfurlTarget =
  | {
      source: 'conversations_history';
      slackChannelId: string;
      messageTimestamp: string;
    }
  | { source: 'composer'; unfurlId: string };

type ParsedSlackLinkSharedEvent =
  | {
      linkShared: {
        unfurlTarget: SlackUnfurlTarget;
        slackUserId: string;
        urls: string[];
      };
    }
  | { linkShared: null; skipReason: string };

// Slack fires link_shared twice for the same link, naming which one it is in
// `source`: once while it sits in the composer, where there is no channel yet
// and only an unfurl id to answer against, and again once the message is posted
const resolveSlackUnfurlTarget = (
  event: SlackInboundEvent,
): SlackUnfurlTarget | undefined => {
  if (event.source === 'composer' && isNonEmptyString(event.unfurl_id)) {
    return { source: 'composer', unfurlId: event.unfurl_id };
  }

  if (isNonEmptyString(event.channel) && isNonEmptyString(event.message_ts)) {
    return {
      source: 'conversations_history',
      slackChannelId: event.channel,
      messageTimestamp: event.message_ts,
    };
  }

  return undefined;
};

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

  const unfurlTarget = resolveSlackUnfurlTarget(event);

  if (!isDefined(unfurlTarget) || !isNonEmptyString(event.user)) {
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
      unfurlTarget,
      slackUserId: event.user,
      urls,
    },
  };
};
