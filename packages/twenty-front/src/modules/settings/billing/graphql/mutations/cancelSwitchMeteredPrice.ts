import { gql } from '@apollo/client';

export const CANCEL_SWITCH_METERED_PRICE = gql`
  mutation CancelSwitchMeteredPrice {
    cancelSwitchMeteredPrice {
      currentBillingSubscription {
        ...CurrentBillingSubscriptionFragment
      }
      billingSubscriptions {
        ...BillingSubscriptionFragment
      }
    }
  }
`;
