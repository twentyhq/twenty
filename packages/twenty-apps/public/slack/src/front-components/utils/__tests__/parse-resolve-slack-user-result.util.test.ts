import { describe, expect, it } from 'vitest';

import { parseResolveSlackUserResult } from 'src/front-components/utils/parse-resolve-slack-user-result.util';

describe('parseResolveSlackUserResult', () => {
  it('should fail generically when the value is not a record', () => {
    const result = parseResolveSlackUserResult('nope');

    expect(result.success).toBe(false);
  });

  it('should fail generically when success is not a boolean', () => {
    const result = parseResolveSlackUserResult({ success: 'yes' });

    expect(result.success).toBe(false);
  });

  it('should surface the server error, then message, then the fallback', () => {
    expect(
      parseResolveSlackUserResult({ success: false, error: 'Not allowed' }),
    ).toEqual({ success: false, error: 'Not allowed' });
    expect(
      parseResolveSlackUserResult({ success: false, message: 'Nope' }),
    ).toEqual({ success: false, error: 'Nope' });

    const fallback = parseResolveSlackUserResult({ success: false });

    expect(fallback.success).toBe(false);

    if (fallback.success === false) {
      expect(fallback.error).toContain('try again');
    }
  });

  it('should fail generically when the slack user is missing or lacks an id', () => {
    expect(parseResolveSlackUserResult({ success: true }).success).toBe(false);
    expect(
      parseResolveSlackUserResult({ success: true, slackUser: { email: 'a' } })
        .success,
    ).toBe(false);
  });

  it('should parse a populated slack user', () => {
    expect(
      parseResolveSlackUserResult({
        success: true,
        slackUser: {
          slackUserId: 'U1',
          slackTeamId: 'T1',
          displayName: 'Ada',
          email: 'ada@twenty.com',
          isInInstalledWorkspace: true,
        },
      }),
    ).toEqual({
      success: true,
      slackUser: {
        slackUserId: 'U1',
        slackTeamId: 'T1',
        displayName: 'Ada',
        email: 'ada@twenty.com',
        isInInstalledWorkspace: true,
      },
    });
  });
});
