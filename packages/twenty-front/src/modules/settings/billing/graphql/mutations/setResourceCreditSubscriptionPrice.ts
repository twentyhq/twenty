import { gql } from '@apollo/client';

export const SET_RESOURCE_CREDIT_SUBSCRIPTION_PRICE = gql`
  mutation SetResourceCreditSubscriptionPrice($priceId: String!) {
    setResourceCreditSubscriptionPrice(priceId: $priceId) {
      currentBillingSubscription {
        ...CurrentBillingSubscriptionFragment
      }
      billingSubscriptions {
        ...BillingSubscriptionFragment
      }
    }
  }
`;
