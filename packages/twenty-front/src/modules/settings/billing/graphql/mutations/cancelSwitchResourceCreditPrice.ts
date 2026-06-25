import { gql } from '@apollo/client';

export const CANCEL_SWITCH_RESOURCE_CREDIT_PRICE = gql`
  mutation CancelSwitchResourceCreditPrice {
    cancelSwitchResourceCreditPrice {
      currentBillingSubscription {
        ...CurrentBillingSubscriptionFragment
      }
      billingSubscriptions {
        ...BillingSubscriptionFragment
      }
    }
  }
`;
