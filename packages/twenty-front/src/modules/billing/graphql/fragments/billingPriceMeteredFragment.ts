import { gql } from '@apollo/client';

export const BILLING_PRICE_METERED_FRAGMENT = gql`
  fragment BillingPriceMeteredFragment on BillingPriceMeteredDTO {
    priceUsageType
    recurringInterval
    stripePriceId
    tiers {
      flatAmount
      unitAmount
      upTo
    }
  }
`;
