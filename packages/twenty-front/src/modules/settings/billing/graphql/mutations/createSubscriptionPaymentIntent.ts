import { gql } from '@apollo/client';

export const CREATE_SUBSCRIPTION_PAYMENT_INTENT = gql`
  mutation CreateSubscriptionPaymentIntent(
    $recurringInterval: SubscriptionInterval!
    $plan: BillingPlanKey!
    $idempotencyKey: String!
  ) {
    createSubscriptionPaymentIntent(
      recurringInterval: $recurringInterval
      plan: $plan
      idempotencyKey: $idempotencyKey
    ) {
      clientSecret
      paymentIntentType
    }
  }
`;
