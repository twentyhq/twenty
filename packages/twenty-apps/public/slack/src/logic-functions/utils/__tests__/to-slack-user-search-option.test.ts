import { describe, expect, it } from 'vitest';

import { toSlackUserSearchOption } from 'src/logic-functions/utils/to-slack-user-search-option';

const INSTALLED_TEAM_ID = 'T-installed';

describe('toSlackUserSearchOption', () => {
  it('should map a vouched full member with its email', () => {
    expect(
      toSlackUserSearchOption({
        member: {
          id: 'U1',
          team_id: INSTALLED_TEAM_ID,
          is_email_confirmed: true,
          real_name: 'Ada Lovelace',
          profile: { display_name: 'ada', email: 'ada@twenty.com' },
        },
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toEqual({
      slackUserId: 'U1',
      slackTeamId: INSTALLED_TEAM_ID,
      displayName: 'ada',
      email: 'ada@twenty.com',
    });
  });

  it('should leave the email out for an unvouched member', () => {
    expect(
      toSlackUserSearchOption({
        member: {
          id: 'U2',
          team_id: 'T-other',
          is_email_confirmed: true,
          profile: { email: 'guest@example.com' },
        },
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toEqual({
      slackUserId: 'U2',
      slackTeamId: INSTALLED_TEAM_ID,
      displayName: undefined,
      email: undefined,
    });
  });
});
