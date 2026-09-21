import { describe, expect, it } from 'vitest';

import { toSlackResolvedUser } from 'src/front-components/utils/to-slack-resolved-user.util';

describe('toSlackResolvedUser', () => {
  it('should return undefined without a slack user id', () => {
    expect(
      toSlackResolvedUser({
        record: { email: 'ada@twenty.com' },
        isInInstalledWorkspace: true,
      }),
    ).toBeUndefined();
  });

  it('should map a populated record and stamp the given workspace flag', () => {
    expect(
      toSlackResolvedUser({
        record: {
          slackUserId: 'U1',
          slackTeamId: 'T1',
          displayName: 'Ada',
          email: 'ada@twenty.com',
        },
        isInInstalledWorkspace: false,
      }),
    ).toEqual({
      slackUserId: 'U1',
      slackTeamId: 'T1',
      displayName: 'Ada',
      email: 'ada@twenty.com',
      isInInstalledWorkspace: false,
    });
  });

  it('should default a missing team to empty and non-string extras to undefined', () => {
    expect(
      toSlackResolvedUser({
        record: { slackUserId: 'U1', displayName: 42, email: null },
        isInInstalledWorkspace: true,
      }),
    ).toEqual({
      slackUserId: 'U1',
      slackTeamId: '',
      displayName: undefined,
      email: undefined,
      isInInstalledWorkspace: true,
    });
  });
});
