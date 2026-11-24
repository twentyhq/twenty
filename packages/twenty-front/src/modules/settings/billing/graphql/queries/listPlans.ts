import { gql } from '@apollo/client';
import { BILLING_PRICE_LICENSED_FRAGMENT } from '@/settings/billing/graphql/fragments/billingPriceLicensedFragment';

export const LIST_PLANS = gql`
  query listPlans {
    listPlans {
      planKey
      isSellable
      isCheckoutDefault
      upgradePlanKeys
      downgradePlanKeys
      baseProducts {
        name
        description
        images
        metadata {
          productKey
          planKey
          isLegacy
        }
        ... on BillingLicensedProduct {
          prices {
            ...BillingPriceLicensedFragment
          }
        }
      }
      resourceCreditProducts {
        name
        description
        images
        metadata {
          productKey
          planKey
          isLegacy
        }
        ... on BillingLicensedProduct {
          prices {
            ...BillingPriceLicensedFragment
          }
        }
      }
    }
  }
  ${BILLING_PRICE_LICENSED_FRAGMENT}
`;
