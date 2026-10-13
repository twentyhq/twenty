import { buildApplicationRegistrationAnalyticsTotals } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-totals.util';

describe('buildApplicationRegistrationAnalyticsTotals', () => {
  it('should return zeroed totals when there are no rows', () => {
    expect(
      buildApplicationRegistrationAnalyticsTotals({
        rows: [],
        activeWorkspaces: 0,
      }),
    ).toEqual({
      installSucceeded: 0,
      installFailed: 0,
      upgradeSucceeded: 0,
      upgradeFailed: 0,
      uninstallSucceeded: 0,
      uninstallFailed: 0,
      functionExecutions: 0,
      functionErrors: 0,
      apiRateLimited: 0,
      jobRateLimited: 0,
      creditsCharged: 0,
      activeWorkspaces: 0,
    });
  });

  it('should map each metric to its field, convert credits and keep the workspace count', () => {
    expect(
      buildApplicationRegistrationAnalyticsTotals({
        rows: [
          { metric: 'install.succeeded', value: '12' },
          { metric: 'install.failed', value: 2 },
          { metric: 'function.execution', value: '1500' },
          { metric: 'function.error', value: 30 },
          { metric: 'api.rate_limited', value: 4 },
          { metric: 'charge.credits_micro', value: '2500000' },
          { metric: 'version.published', value: 3 },
        ],
        activeWorkspaces: 7,
      }),
    ).toEqual({
      installSucceeded: 12,
      installFailed: 2,
      upgradeSucceeded: 0,
      upgradeFailed: 0,
      uninstallSucceeded: 0,
      uninstallFailed: 0,
      functionExecutions: 1500,
      functionErrors: 30,
      apiRateLimited: 4,
      jobRateLimited: 0,
      creditsCharged: 2.5,
      activeWorkspaces: 7,
    });
  });

  it('should ignore metrics it does not know', () => {
    expect(
      buildApplicationRegistrationAnalyticsTotals({
        rows: [{ metric: 'unknown.metric', value: 99 }],
        activeWorkspaces: 3,
      }).installSucceeded,
    ).toBe(0);
  });
});
