import { gql } from '@apollo/client';

export const SET_METERED_SUBSCRIPTION_PRICE = gql`
  mutation SetMeteredSubscriptionPrice($priceId: String!) {
    setMeteredSubscriptionPrice(priceId: $priceId) {
      currentBillingSubscription {
        ...CurrentBillingSubscriptionFragment
      }
      billingSubscriptions {
        ...BillingSubscriptionFragment
      }
    }
  }
`;
