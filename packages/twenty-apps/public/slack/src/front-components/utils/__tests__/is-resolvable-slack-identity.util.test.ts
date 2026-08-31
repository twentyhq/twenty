import { describe, expect, it } from 'vitest';

import { isResolvableSlackIdentity } from 'src/front-components/utils/is-resolvable-slack-identity.util';

describe('isResolvableSlackIdentity', () => {
  it('should accept a Slack-shaped user id', () => {
    expect(
      isResolvableSlackIdentity({
        slackUserId: 'U0123456789',
        slackTeamId: undefined,
      }),
    ).toBe(true);
  });

  it('should accept a workspace-scoped user id', () => {
    expect(
      isResolvableSlackIdentity({
        slackUserId: 'W0123456789',
        slackTeamId: undefined,
      }),
    ).toBe(true);
  });

  it('should reject an id still being typed', () => {
    expect(
      isResolvableSlackIdentity({ slackUserId: 'U01', slackTeamId: undefined }),
    ).toBe(false);
  });

  it('should reject an id not shaped like a Slack user id', () => {
    expect(
      isResolvableSlackIdentity({
        slackUserId: 'not-an-id',
        slackTeamId: undefined,
      }),
    ).toBe(false);
  });

  it('should reject an empty identity', () => {
    expect(
      isResolvableSlackIdentity({
        slackUserId: undefined,
        slackTeamId: undefined,
      }),
    ).toBe(false);
  });
});
