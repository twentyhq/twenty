import { gql } from '@apollo/client';

export const USAGE_QUOTA_DEFINITIONS = gql`
  query UsageQuotaDefinitions {
    usageQuotaDefinitions {
      definitions {
        resourceType
        allowedOperationTypes
        allowedSpenderTypes
        allowedMeters
      }
      isIntraWorkspaceLimitEntitled
      hasAllowancePeriod
    }
  }
`;
