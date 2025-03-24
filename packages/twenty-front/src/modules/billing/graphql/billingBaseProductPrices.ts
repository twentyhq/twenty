import { gql } from '@apollo/client';

export const BILLING_BASE_PRODUCT_PRICES = gql`
  query billingBaseProductPrices {
    plans {
      planKey
      baseProduct {
        name
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
