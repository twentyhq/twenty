import { describe, expect, it } from 'vitest';

import { parseSlackLinkSharedEvent } from 'src/logic-functions/utils/parse-slack-link-shared-event';

const buildLinkSharedBody = ({
  eventOverrides = {},
}: { eventOverrides?: Record<string, unknown> } = {}) => ({
  type: 'event_callback',
  event: {
    type: 'link_shared',
    channel: 'C123',
    message_ts: '1700000000.000100',
    user: 'U123',
    links: [
      { url: 'https://acme.twenty.com/object/person/abc', domain: 'acme.twenty.com' },
    ],
    ...eventOverrides,
  },
});

const buildComposerLinkSharedBody = ({
  eventOverrides = {},
}: { eventOverrides?: Record<string, unknown> } = {}) =>
  buildLinkSharedBody({
    eventOverrides: {
      channel: undefined,
      channel_id: 'COMPOSER',
      source: 'composer',
      unfurl_id: 'gryl3kb80b3wm49ihzoo35fyqoq08n2y',
      message_ts: 'gryl3kb80b3wm49ihzoo35fyqoq08n2y',
      ...eventOverrides,
    },
  });

describe('parseSlackLinkSharedEvent', () => {
  it('should parse a link_shared event', () => {
    expect(parseSlackLinkSharedEvent(buildLinkSharedBody())).toEqual({
      linkShared: {
        unfurlTarget: {
          source: 'conversations_history',
          slackChannelId: 'C123',
          messageTimestamp: '1700000000.000100',
        },
        slackUserId: 'U123',
        urls: ['https://acme.twenty.com/object/person/abc'],
      },
    });
  });

  it('should parse a composer link_shared event', () => {
    expect(parseSlackLinkSharedEvent(buildComposerLinkSharedBody())).toEqual({
      linkShared: {
        unfurlTarget: {
          source: 'composer',
          unfurlId: 'gryl3kb80b3wm49ihzoo35fyqoq08n2y',
        },
        slackUserId: 'U123',
        urls: ['https://acme.twenty.com/object/person/abc'],
      },
    });
  });

  it('should skip a composer event missing its unfurl id', () => {
    const result = parseSlackLinkSharedEvent(
      buildComposerLinkSharedBody({ eventOverrides: { unfurl_id: undefined } }),
    );

    expect(result.linkShared).toBeNull();
  });

  it('should skip other body types', () => {
    const result = parseSlackLinkSharedEvent({ type: 'url_verification' });

    expect(result.linkShared).toBeNull();
  });

  it('should skip other event types', () => {
    const result = parseSlackLinkSharedEvent(
      buildLinkSharedBody({ eventOverrides: { type: 'app_mention' } }),
    );

    expect(result.linkShared).toBeNull();
  });

  it.each(['channel', 'message_ts', 'user'])(
    'should skip an event missing %s',
    (missingField) => {
      const result = parseSlackLinkSharedEvent(
        buildLinkSharedBody({ eventOverrides: { [missingField]: undefined } }),
      );

      expect(result.linkShared).toBeNull();
    },
  );

  it('should skip an event with no usable link URLs', () => {
    const result = parseSlackLinkSharedEvent(
      buildLinkSharedBody({ eventOverrides: { links: [{ domain: 'a.com' }] } }),
    );

    expect(result.linkShared).toBeNull();
  });
});
