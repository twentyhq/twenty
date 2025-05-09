import { gql } from '@apollo/client';

export const SAVE_BILLING_PLAN_ID = gql`
  mutation SaveBillingPlanId($planId: String!, $workspaceId: String!) {
    saveBillingPlanId(planId: $planId, workspaceId: $workspaceId) {
      id
      planId
    }
  }
`;
