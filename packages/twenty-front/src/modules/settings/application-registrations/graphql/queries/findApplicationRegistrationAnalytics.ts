import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_ANALYTICS = gql`
  query FindApplicationRegistrationAnalytics(
    $input: ApplicationRegistrationAnalyticsInput!
  ) {
    findApplicationRegistrationAnalytics(input: $input) {
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
  }
`;
