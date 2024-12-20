import { gql } from '@apollo/client';

export const CHECKOUT_SESSION = gql`
  mutation CheckoutSession(
    $recurringInterval: SubscriptionInterval!
    $successUrlPath: String
    $plan: BillingPlanKey!
  ) {
    checkoutSession(
      recurringInterval: $recurringInterval
      successUrlPath: $successUrlPath
      plan: $plan
    ) {
      url
    }
  }
`;
