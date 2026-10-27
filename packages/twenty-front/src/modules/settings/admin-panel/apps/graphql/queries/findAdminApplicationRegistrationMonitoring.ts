import { gql } from '@apollo/client';

export const FIND_ADMIN_APPLICATION_REGISTRATION_MONITORING = gql`
  query FindAdminApplicationRegistrationMonitoring(
    $id: String!
    $workspaceId: String
    $periodStart: DateTime
    $periodEnd: DateTime
  ) {
    findAdminApplicationRegistrationMonitoring(
      id: $id
      workspaceId: $workspaceId
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
      creditsUsed
      activity {
        bucketStart
        errorCount
        rateLimitedRequestCount
        rateLimitedJobCount
      }
      lifecycle {
        bucketStart
        installCount
        upgradeCount
        uninstallCount
        failedCount
      }
      creditUsage {
        bucketStart
        operationType
        creditsUsed
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
      activeWorkspaceCount
      workspaces {
        workspaceId
        workspaceName
        workspaceLogoUrl
        applicationVersion
        runCount
        failedRunCount
        rateLimitEventCount
        lastEventAt
      }
    }
  }
`;
