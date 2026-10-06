import { gql } from '@apollo/client';

export const USAGE_QUOTA_DEFINITIONS = gql`
  query UsageQuotaDefinitions {
    usageQuotaDefinitions {
      definitions {
        resourceType
        allowedOperations {
          operationType
          allowedUnits
        }
        allowedSpenderTypes
        operatorOnlyScopes {
          operationType
          spenderType
          unit
          periodUnit
        }
      }
      isIntraWorkspaceLimitEntitled
      hasAllowancePeriod
    }
  }
`;
