import { gql } from '@apollo/client';

export const GET_ALL_BILLING_PLAN = gql`
  query GetAllBillingPlans($workspaceId: String!) {
    getAllBillingPlans(workspaceId: $workspaceId) {
      planId
      workspace {
        id
      }
    }
  }
`;
