import { gql } from '@apollo/client';

export const CHECKOUT_SESSION = gql`
  mutation CheckoutSession(
    $recurringInterval: SubscriptionInterval!
    $successUrlPath: String
    $plan: BillingPlanKey!
    $requirePaymentMethod: Boolean!
    $paymentProvider: BillingPaymentProviders
  ) {
    checkoutSession(
      recurringInterval: $recurringInterval
      successUrlPath: $successUrlPath
      plan: $plan
      requirePaymentMethod: $requirePaymentMethod
      paymentProvider: $paymentProvider
    ) {
      url
    }
  }
`;
