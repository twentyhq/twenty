import { gql } from '@apollo/client';

export const SWITCH_SUBSCRIPTION_INTERVAL = gql`
  mutation SwitchSubscriptionInterval {
    switchSubscriptionInterval {
      currentBillingSubscription {
        ...CurrentBillingSubscriptionFragment
      }
      billingSubscriptions {
        ...BillingSubscriptionFragment
      }
    }
  }
`;
