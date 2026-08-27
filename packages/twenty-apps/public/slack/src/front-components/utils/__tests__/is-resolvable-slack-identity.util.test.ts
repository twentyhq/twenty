import { describe, expect, it } from 'vitest';

import { isResolvableSlackIdentity } from 'src/front-components/utils/is-resolvable-slack-identity.util';

describe('isResolvableSlackIdentity', () => {
  it('should accept a complete email', () => {
    expect(
      isResolvableSlackIdentity({
        email: 'ada@twenty.com',
        slackUserId: undefined,
        slackTeamId: undefined,
      }),
    ).toBe(true);
  });

  it('should reject a partial email still being typed', () => {
    expect(
      isResolvableSlackIdentity({
        email: 'ada@twenty',
        slackUserId: undefined,
        slackTeamId: undefined,
      }),
    ).toBe(false);
  });

  it('should accept a Slack-shaped user id', () => {
    expect(
      isResolvableSlackIdentity({
        email: undefined,
        slackUserId: 'U0123456789',
        slackTeamId: undefined,
      }),
    ).toBe(true);
  });

  it('should let the user id take precedence over a valid email', () => {
    expect(
      isResolvableSlackIdentity({
        email: 'ada@twenty.com',
        slackUserId: 'U01',
        slackTeamId: undefined,
      }),
    ).toBe(false);
  });

  it('should reject an id not shaped like a Slack user id', () => {
    expect(
      isResolvableSlackIdentity({
        email: undefined,
        slackUserId: 'not-an-id',
        slackTeamId: undefined,
      }),
    ).toBe(false);
  });

  it('should reject an empty identity', () => {
    expect(
      isResolvableSlackIdentity({
        email: undefined,
        slackUserId: undefined,
        slackTeamId: undefined,
      }),
    ).toBe(false);
  });
});
