import { type ApplicationRegistrationAnalyticsCounts } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-analytics-counts.type';

export const createEmptyApplicationRegistrationAnalyticsCounts =
  (): ApplicationRegistrationAnalyticsCounts => ({
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
  });
