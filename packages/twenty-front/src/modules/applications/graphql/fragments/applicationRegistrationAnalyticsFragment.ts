import { gql } from '@apollo/client';

export const APPLICATION_REGISTRATION_ANALYTICS_FRAGMENT = gql`
  fragment ApplicationRegistrationAnalyticsFragment on ApplicationRegistrationAnalytics {
    periodStart
    periodEnd
    totals {
      installSucceeded
      installFailed
      upgradeSucceeded
      upgradeFailed
      uninstallSucceeded
      uninstallFailed
      functionExecutions
      functionErrors
      apiRateLimited
      jobRateLimited
      creditsCharged
      activeWorkspaces
    }
    timeSeries {
      date
      installSucceeded
      installFailed
      upgradeSucceeded
      upgradeFailed
      uninstallSucceeded
      uninstallFailed
      functionExecutions
      functionErrors
      apiRateLimited
      jobRateLimited
      creditsCharged
    }
    functionErrorsByType {
      key
      value
    }
    functionErrorsByFunction {
      key
      value
    }
    functionExecutionsByFunction {
      key
      value
    }
    lifecycleFailuresByErrorCode {
      key
      value
    }
    creditsChargedByOperation {
      key
      value
    }
    versions {
      version
      activeWorkspaces
      installSucceeded
      installFailed
      upgradeSucceeded
      upgradeFailed
      functionExecutions
      functionErrors
      timeSeries {
        date
        activeWorkspaces
      }
    }
  }
`;
