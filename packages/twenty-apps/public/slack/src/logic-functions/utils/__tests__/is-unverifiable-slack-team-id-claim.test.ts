import { describe, expect, it } from 'vitest';

import { isUnverifiableSlackTeamIdClaim } from 'src/logic-functions/utils/is-unverifiable-slack-team-id-claim';

const INSTALLED_TEAM_ID = 'T0INSTALLED';
const OTHER_TEAM_ID = 'T0CONNECTED';

const isUnverifiable = ({
  requestedSlackTeamId,
  resolvedSlackAccount,
}: {
  requestedSlackTeamId: string | undefined;
  resolvedSlackAccount: { slackTeamId: string | undefined } | undefined;
}) =>
  isUnverifiableSlackTeamIdClaim({
    requestedSlackTeamId,
    resolvedSlackAccount,
    installedSlackTeamId: INSTALLED_TEAM_ID,
  });

describe('isUnverifiableSlackTeamIdClaim', () => {
  it('should refuse a foreign team id Slack would not corroborate', () => {
    expect(
      isUnverifiable({
        requestedSlackTeamId: OTHER_TEAM_ID,
        resolvedSlackAccount: { slackTeamId: undefined },
      }),
    ).toBe(true);
  });

  it('should accept the installed team id for an account Slack reports no team for', () => {
    expect(
      isUnverifiable({
        requestedSlackTeamId: INSTALLED_TEAM_ID,
        resolvedSlackAccount: { slackTeamId: undefined },
      }),
    ).toBe(false);
  });

  it('should leave a team id Slack does corroborate to the mismatch check', () => {
    expect(
      isUnverifiable({
        requestedSlackTeamId: OTHER_TEAM_ID,
        resolvedSlackAccount: { slackTeamId: OTHER_TEAM_ID },
      }),
    ).toBe(false);
  });

  it('should not apply to an account Slack could not resolve at all', () => {
    expect(
      isUnverifiable({
        requestedSlackTeamId: OTHER_TEAM_ID,
        resolvedSlackAccount: undefined,
      }),
    ).toBe(false);
  });

  it('should not apply when no team id was requested', () => {
    expect(
      isUnverifiable({
        requestedSlackTeamId: undefined,
        resolvedSlackAccount: { slackTeamId: undefined },
      }),
    ).toBe(false);
  });
});
