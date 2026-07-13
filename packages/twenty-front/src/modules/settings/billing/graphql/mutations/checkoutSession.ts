import { gql } from '@apollo/client';

export const CHECKOUT_SESSION = gql`
  mutation CheckoutSession(
    $recurringInterval: SubscriptionInterval!
    $successUrlPath: String
    $plan: BillingPlanKey!
    $requirePaymentMethod: Boolean!
    $couponCode: String
  ) {
    checkoutSession(
      recurringInterval: $recurringInterval
      successUrlPath: $successUrlPath
      plan: $plan
      requirePaymentMethod: $requirePaymentMethod
      couponCode: $couponCode
    ) {
      url
    }
  }
`;
