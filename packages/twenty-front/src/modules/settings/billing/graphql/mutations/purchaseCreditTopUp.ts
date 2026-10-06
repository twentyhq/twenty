import { gql } from '@apollo/client';

export const PURCHASE_CREDIT_TOP_UP = gql`
  mutation PurchaseCreditTopUp($creditAmount: Float!, $idempotencyKey: UUID!) {
    purchaseCreditTopUp(
      creditAmount: $creditAmount
      idempotencyKey: $idempotencyKey
    ) {
      status
      hostedInvoiceUrl
      currentBillingSubscription {
        ...CurrentBillingSubscriptionFragment
      }
      billingSubscriptions {
        ...BillingSubscriptionFragment
      }
    }
  }
`;
