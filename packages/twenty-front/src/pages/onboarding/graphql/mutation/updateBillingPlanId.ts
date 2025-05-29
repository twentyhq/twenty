// graphql/mutations/updateBillingPlan.ts
import { gql } from '@apollo/client';

export const UPDATE_BILLING_PLAN = gql`
  mutation UpdateBillingPlans($updateBillingPlansInput: UpdateBillingPlansInput!) {
    updateBillingPlans(updateBillingPlansInput: $updateBillingPlansInput) {
      id
      planId
    }
  }
`;
