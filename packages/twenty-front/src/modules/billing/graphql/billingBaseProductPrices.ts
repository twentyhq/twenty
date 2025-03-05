import { gql } from '@apollo/client';

export const BILLING_BASE_PRODUCT_PRICES = gql`
  query billingBaseProductPrices {
    plans {
      planKey
      baseProduct {
        prices {
          ... on BillingPriceLicensedDTO {
            unitAmount
            stripePriceId
            recurringInterval
          }
        }
      }
    }
  }
`;
