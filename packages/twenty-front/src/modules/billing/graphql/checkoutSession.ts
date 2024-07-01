import { gql } from '@apollo/client';

export const CHECKOUT_SESSION = gql`
  mutation CheckoutSession(
    $recurringInterval: SubscriptionInterval!
    $successUrlPath: String
  ) {
    checkoutSession(
      recurringInterval: $recurringInterval
      successUrlPath: $successUrlPath
    ) {
      url
    }
  }
`;
