import { describe, expect, it } from 'vitest';

import { parseSlackLinkSharedEvent } from 'src/logic-functions/utils/parse-slack-link-shared-event';

const buildLinkSharedBody = (
  eventOverrides: Record<string, unknown> = {},
) => ({
  type: 'event_callback',
  team_id: 'T123',
  event: {
    type: 'link_shared',
    channel: 'C123',
    message_ts: '1700000000.000100',
    links: [
      {
        url: 'https://acme.twenty.com/object/company/6b1e6a4b-5e3f-4c2d-9a8b-1f2e3d4c5b6a',
        domain: 'acme.twenty.com',
      },
    ],
    ...eventOverrides,
  },
});

describe('parseSlackLinkSharedEvent', () => {
  it('should parse channel, message timestamp and link urls when the event is a link_shared callback', () => {
    const parsed = parseSlackLinkSharedEvent(buildLinkSharedBody());

    expect(parsed.linkShared).toEqual({
      slackChannelId: 'C123',
      messageTimestamp: '1700000000.000100',
      linkUrls: [
        'https://acme.twenty.com/object/company/6b1e6a4b-5e3f-4c2d-9a8b-1f2e3d4c5b6a',
      ],
    });
  });

  it('should deduplicate repeated link urls', () => {
    const linkUrl =
      'https://acme.twenty.com/object/person/6b1e6a4b-5e3f-4c2d-9a8b-1f2e3d4c5b6a';
    const parsed = parseSlackLinkSharedEvent(
      buildLinkSharedBody({
        links: [{ url: linkUrl }, { url: linkUrl }],
      }),
    );

    expect(parsed.linkShared?.linkUrls).toEqual([linkUrl]);
  });

  it('should skip when the body is not an event callback', () => {
    const parsed = parseSlackLinkSharedEvent({ type: 'url_verification' });

    expect(parsed.linkShared).toBeNull();
  });

  it('should skip when the event type is not link_shared', () => {
    const parsed = parseSlackLinkSharedEvent(
      buildLinkSharedBody({ type: 'app_mention' }),
    );

    expect(parsed.linkShared).toBeNull();
  });

  it('should skip composer previews with no posted message', () => {
    const parsed = parseSlackLinkSharedEvent(
      buildLinkSharedBody({
        channel: 'COMPOSER',
        message_ts: undefined,
        source: 'composer',
      }),
    );

    expect(parsed.linkShared).toBeNull();
  });

  it('should skip when the event has no links', () => {
    const parsed = parseSlackLinkSharedEvent(
      buildLinkSharedBody({ links: [] }),
    );

    expect(parsed.linkShared).toBeNull();
  });
});
