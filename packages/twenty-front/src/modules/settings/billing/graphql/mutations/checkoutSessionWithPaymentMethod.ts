import { gql } from '@apollo/client';

// Mirrors the CheckoutSession mutation but selects `clientSecret` instead of
// `url`. Used by the inline onboarding flow where the subscription is created
// server-side and the payment method is collected with the Stripe Payment
// Element via stripe.confirmSetup().
export const CHECKOUT_SESSION_WITH_PAYMENT_METHOD = gql`
  mutation CheckoutSessionWithPaymentMethod(
    $recurringInterval: SubscriptionInterval!
    $successUrlPath: String
    $plan: BillingPlanKey!
    $requirePaymentMethod: Boolean!
  ) {
    checkoutSession(
      recurringInterval: $recurringInterval
      successUrlPath: $successUrlPath
      plan: $plan
      requirePaymentMethod: $requirePaymentMethod
    ) {
      clientSecret
    }
  }
`;
