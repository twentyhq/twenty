import type { ListPlansQuery } from '~/generated-metadata/graphql';

export const mockBillingPlansCOP = {
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
              stripePriceId: 'price_pro_monthly_cop',
              unitAmount: 7900000, // $79,000 COP
              recurringInterval: 'Month',
              priceUsageType: 'LICENSED',
            },
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_pro_yearly_cop',
              unitAmount: 79000000, // $790,000 COP/año (ahorro ~17%)
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
              stripePriceId: 'price_enterprise_monthly_cop',
              unitAmount: null,
              recurringInterval: 'Month',
              priceUsageType: 'LICENSED',
            },
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_enterprise_yearly_cop',
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
