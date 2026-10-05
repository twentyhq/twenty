import { gql } from '@apollo/client';

export const WORKSPACE_USAGE_LIMITS = gql`
  query WorkspaceUsageLimits($workspaceId: UUID!) {
    workspaceUsageLimits(workspaceId: $workspaceId) {
      defaults {
        resourceType
        operationType
        spenderType
        limitKind
        periodCount
        periodUnit
        unit
        limitValue
        isOverridable
        overriddenByUsageLimitId
      }
      limits {
        id
        periodCount
        periodUnit
        limitValue
        burstValue
      }
    }
  }
`;
