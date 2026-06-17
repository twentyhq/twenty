import { gql } from '@apollo/client';

export const CREATE_SUBSCRIPTION_PAYMENT_INTENT = gql`
  mutation CreateSubscriptionPaymentIntent(
    $recurringInterval: SubscriptionInterval!
    $plan: BillingPlanKey!
  ) {
    createSubscriptionPaymentIntent(
      recurringInterval: $recurringInterval
      plan: $plan
    ) {
      clientSecret
      paymentIntentType
    }
  }
`;
