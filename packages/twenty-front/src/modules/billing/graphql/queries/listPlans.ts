import { gql } from '@apollo/client';
import { BILLING_PRICE_METERED_FRAGMENT } from '@/billing/graphql/fragments/billingPriceMeteredFragment';
import { BILLING_PRICE_LICENSED_FRAGMENT } from '@/billing/graphql/fragments/billingPriceLicensedFragment';

export const LIST_PLANS = gql`
  query listPlans {
    listPlans {
      planKey
      licensedProducts {
        name
        description
        images
        metadata {
          productKey
          planKey
          priceUsageBased
        }
        ... on BillingLicensedProduct {
          prices {
            ...BillingPriceLicensedFragment
          }
        }
      }
      meteredProducts {
        name
        description
        images
        metadata {
          productKey
          planKey
          priceUsageBased
        }
        ... on BillingMeteredProduct {
          prices {
            ...BillingPriceMeteredFragment
          }
        }
      }
    }
  }
  ${BILLING_PRICE_LICENSED_FRAGMENT}
  ${BILLING_PRICE_METERED_FRAGMENT}
`;
