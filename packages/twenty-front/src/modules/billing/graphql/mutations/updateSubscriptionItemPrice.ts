import { gql } from '@apollo/client';

export const UPDATE_SUBSCRIPTION_ITEM_PRICE = gql`
  mutation UpdateSubscriptionItemPrice($priceId: String!) {
    updateSubscriptionItemPrice(priceId: $priceId) {
      success
    }
  }
`;
