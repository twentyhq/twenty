import { describe, expect, it } from 'vitest';

import { parseSlackHomeOpenedEvent } from 'src/logic-functions/utils/parse-slack-home-opened-event';

const buildHomeOpenedBody = (overrides: Record<string, unknown> = {}) => ({
  type: 'event_callback',
  event_id: 'Ev123',
  team_id: 'T123',
  event: {
    type: 'app_home_opened',
    user: 'U123',
    channel: 'D123',
    tab: 'messages',
    ...overrides,
  },
});

describe('parseSlackHomeOpenedEvent', () => {
  it('should parse a messages-tab open', () => {
    const result = parseSlackHomeOpenedEvent(buildHomeOpenedBody());

    expect(result).toEqual({
      homeOpened: { slackChannelId: 'D123', slackUserId: 'U123' },
    });
  });

  it('should skip other tabs', () => {
    const result = parseSlackHomeOpenedEvent(
      buildHomeOpenedBody({ tab: 'home' }),
    );

    expect(result).toEqual({
      homeOpened: null,
      skipReason: 'Unhandled app home tab: home',
    });
  });

  it('should skip other event types', () => {
    const result = parseSlackHomeOpenedEvent(
      buildHomeOpenedBody({ type: 'app_mention' }),
    );

    expect(result).toEqual({
      homeOpened: null,
      skipReason: 'Unhandled event type: app_mention',
    });
  });

  it('should skip non event_callback bodies', () => {
    const result = parseSlackHomeOpenedEvent({ type: 'url_verification' });

    expect(result).toEqual({
      homeOpened: null,
      skipReason: 'Unhandled body type: url_verification',
    });
  });

  it('should skip a body without an event payload', () => {
    const result = parseSlackHomeOpenedEvent({ type: 'event_callback' });

    expect(result).toEqual({
      homeOpened: null,
      skipReason: 'Missing event payload',
    });
  });

  it('should skip an event without a channel', () => {
    const result = parseSlackHomeOpenedEvent(
      buildHomeOpenedBody({ channel: undefined }),
    );

    expect(result).toEqual({
      homeOpened: null,
      skipReason: 'Event is missing required fields',
    });
  });

  it('should skip an event without a user', () => {
    const result = parseSlackHomeOpenedEvent(
      buildHomeOpenedBody({ user: '' }),
    );

    expect(result).toEqual({
      homeOpened: null,
      skipReason: 'Event is missing required fields',
    });
  });
});
