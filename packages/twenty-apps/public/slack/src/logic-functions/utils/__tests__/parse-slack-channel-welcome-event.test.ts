import { describe, expect, it } from 'vitest';

import { parseSlackChannelWelcomeEvent } from 'src/logic-functions/utils/parse-slack-channel-welcome-event';

const buildJoinBody = (overrides: Record<string, unknown> = {}) => ({
  type: 'event_callback',
  event_id: 'Ev123',
  team_id: 'T123',
  event: {
    type: 'member_joined_channel',
    user: 'UBOT',
    channel: 'C123',
    ...overrides,
  },
});

describe('parseSlackChannelWelcomeEvent', () => {
  it('should parse a member_joined_channel event', () => {
    const result = parseSlackChannelWelcomeEvent(buildJoinBody());

    expect(result).toEqual({
      channelJoin: { slackChannelId: 'C123', slackUserId: 'UBOT' },
    });
  });

  it('should skip a body that is not an event callback', () => {
    const result = parseSlackChannelWelcomeEvent({ type: 'url_verification' });

    expect(result).toEqual({
      channelJoin: null,
      skipReason: 'Unhandled body type: url_verification',
    });
  });

  it('should skip a body without an event payload', () => {
    const result = parseSlackChannelWelcomeEvent({ type: 'event_callback' });

    expect(result).toEqual({
      channelJoin: null,
      skipReason: 'Missing event payload',
    });
  });

  it('should skip another event type so message events keep going to the assistant', () => {
    const result = parseSlackChannelWelcomeEvent(
      buildJoinBody({ type: 'app_mention' }),
    );

    expect(result).toEqual({
      channelJoin: null,
      skipReason: 'Unhandled event type: app_mention',
    });
  });

  it('should skip an event missing the channel', () => {
    const result = parseSlackChannelWelcomeEvent(
      buildJoinBody({ channel: '' }),
    );

    expect(result).toEqual({
      channelJoin: null,
      skipReason: 'Event is missing required fields',
    });
  });

  it('should skip an event missing the user', () => {
    const result = parseSlackChannelWelcomeEvent(
      buildJoinBody({ user: undefined }),
    );

    expect(result).toEqual({
      channelJoin: null,
      skipReason: 'Event is missing required fields',
    });
  });
});
