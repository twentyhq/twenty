import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_MONITORING = gql`
  query FindApplicationRegistrationMonitoring(
    $id: String!
    $periodStart: DateTime
    $periodEnd: DateTime
  ) {
    findApplicationRegistrationMonitoring(
      id: $id
      periodStart: $periodStart
      periodEnd: $periodEnd
    ) {
      periodStart
      periodEnd
      bucketSizeInSeconds
      lookbackInHours
      runCount
      failedRunCount
      lifecycleFailureCount
      rateLimitEventCount
      activity {
        bucketStart
        errorCount
        warningCount
        infoCount
      }
      lifecycle {
        bucketStart
        installCount
        upgradeCount
        uninstallCount
        failedCount
      }
      issues {
        level
        source
        errorCode
        logicFunctionName
        versions
        eventCount
        affectedInstallCount
        lastSeenAt
      }
      versions {
        version
        runCount
        failedRunCount
        activeInstallCount
      }
      functions {
        logicFunctionName
        runCount
        failedRunCount
        p95DurationMs
      }
    }
  }
`;
