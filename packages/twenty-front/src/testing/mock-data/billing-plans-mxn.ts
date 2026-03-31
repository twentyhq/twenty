import type { ListPlansQuery } from '~/generated-metadata/graphql';

export const mockBillingPlansMXN = {
  listPlans: [
    {
      __typename: 'BillingPlan',
      planKey: 'FREE',
      licensedProducts: [
        {
          __typename: 'BillingLicensedProduct',
          name: 'Free Plan',
          description: 'Para equipos pequeños que inician',
          images: [],
          metadata: {
            __typename: 'BillingProductMetadata',
            productKey: 'BASE_PRODUCT',
            planKey: 'FREE',
            priceUsageBased: 'LICENSED',
          },
          prices: [
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_free_monthly',
              unitAmount: 0,
              recurringInterval: 'Month',
              priceUsageType: 'LICENSED',
            },
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_free_yearly',
              unitAmount: 0,
              recurringInterval: 'Year',
              priceUsageType: 'LICENSED',
            },
          ],
        },
      ],
      meteredProducts: [],
    },
    {
      __typename: 'BillingPlan',
      planKey: 'PRO',
      licensedProducts: [
        {
          __typename: 'BillingLicensedProduct',
          name: 'Pro Plan',
          description: 'Para equipos en crecimiento',
          images: [],
          metadata: {
            __typename: 'BillingProductMetadata',
            productKey: 'BASE_PRODUCT',
            planKey: 'PRO',
            priceUsageBased: 'LICENSED',
          },
          prices: [
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_pro_monthly_mxn',
              unitAmount: 29900, // $299 MXN
              recurringInterval: 'Month',
              priceUsageType: 'LICENSED',
            },
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_pro_yearly_mxn',
              unitAmount: 299000, // $2,990 MXN/año (ahorro ~17%)
              recurringInterval: 'Year',
              priceUsageType: 'LICENSED',
            },
          ],
        },
      ],
      meteredProducts: [],
    },
    {
      __typename: 'BillingPlan',
      planKey: 'ENTERPRISE',
      licensedProducts: [
        {
          __typename: 'BillingLicensedProduct',
          name: 'Enterprise Plan',
          description: 'Para organizaciones grandes',
          images: [],
          metadata: {
            __typename: 'BillingProductMetadata',
            productKey: 'BASE_PRODUCT',
            planKey: 'ENTERPRISE',
            priceUsageBased: 'LICENSED',
          },
          prices: [
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_enterprise_monthly_mxn',
              unitAmount: null,
              recurringInterval: 'Month',
              priceUsageType: 'LICENSED',
            },
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_enterprise_yearly_mxn',
              unitAmount: null,
              recurringInterval: 'Year',
              priceUsageType: 'LICENSED',
            },
          ],
        },
      ],
      meteredProducts: [],
    },
  ],
} as ListPlansQuery;
