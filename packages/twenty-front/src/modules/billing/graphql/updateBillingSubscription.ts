import { gql } from '@apollo/client';

export const UPDATE_BILLING_SUBSCRIPTION = gql`
  mutation UpdateBillingSubscription {
    updateBillingSubscription {
      success
    }
  }
`;
