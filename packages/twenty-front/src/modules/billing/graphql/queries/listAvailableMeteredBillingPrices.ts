import { gql } from '@apollo/client';

export const LIST_AVAILABLE_METERED_BILLING_PRICES = gql`
  query listAvailableMeteredBillingPrices {
    listAvailableMeteredBillingPrices {
      nickname
      amount
      stripePriceId
      interval
    }
  }
`;
