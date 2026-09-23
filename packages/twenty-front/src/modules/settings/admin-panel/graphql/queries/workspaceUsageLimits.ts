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
        meter
        limitValue
        limitValueConfigVariable
        windowMsConfigVariable
        counterScope
        isOverridable
        isEnforcedOnCurrentPlan
        overriddenByUsageLimitId
      }
      limits {
        id
        resourceType
        operationType
        spenderType
        spenderId
        limitKind
        periodCount
        periodUnit
        meter
        limitValue
        burstValue
        isEnforcedOnCurrentPlan
        suppressesDefault
        createdAt
        updatedAt
      }
    }
  }
`;
