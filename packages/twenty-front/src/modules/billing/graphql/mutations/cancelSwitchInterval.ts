import { gql } from '@apollo/client';

export const CANCEL_SWITCH_BILLING_INTERVAL = gql`
  mutation CancelSwitchBillingInterval {
    cancelSwitchBillingInterval {
      currentBillingSubscription {
        ...CurrentBillingSubscriptionFragment
      }
      billingSubscriptions {
        ...BillingSubscriptionFragment
      }
    }
  }
`;
