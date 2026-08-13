import { isNonEmptyString } from '@sniptt/guards';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

type ParsedSlackLinkSharedEvent =
  | {
      linkShared: {
        slackChannelId: string;
        messageTimestamp: string;
        linkUrls: string[];
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

  if (!event) {
    return { linkShared: null, skipReason: 'Missing event payload' };
  }

  if (event.type !== 'link_shared') {
    return {
      linkShared: null,
      skipReason: `Unhandled event type: ${event.type}`,
    };
  }

  // Composer previews have no posted message to attach an unfurl to
  if (event.source === 'composer') {
    return { linkShared: null, skipReason: 'Composer previews are skipped' };
  }

  if (
    !isNonEmptyString(event.channel) ||
    !isNonEmptyString(event.message_ts)
  ) {
    return {
      linkShared: null,
      skipReason: 'Event has no channel or message timestamp',
    };
  }

  const linkUrls = [
    ...new Set(
      (event.links ?? [])
        .map((link) => link.url)
        .filter((url): url is string => isNonEmptyString(url)),
    ),
  ];

  if (linkUrls.length === 0) {
    return { linkShared: null, skipReason: 'Event has no links' };
  }

  return {
    linkShared: {
      slackChannelId: event.channel,
      messageTimestamp: event.message_ts,
      linkUrls,
    },
  };
};
