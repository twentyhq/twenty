import type { ListPlansQuery } from '~/generated-metadata/graphql';

export const mockBillingPlans = {
  listPlans: [
    {
      __typename: 'BillingPlan',
      planKey: 'PRO',
      isSellable: true,
      isCheckoutDefault: true,
      upgradePlanKeys: ['ENTERPRISE'],
      downgradePlanKeys: [],
      baseProducts: [
        {
          __typename: 'BillingLicensedProduct',
          name: 'Pro Plan',
          description: 'For growing teams',
          images: [],
          metadata: {
            __typename: 'BillingProductMetadata',
            isLegacy: null,
            productKey: 'BASE_PRODUCT',
            planKey: 'PRO',
          },
          prices: [
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_1RyF4BQh1LFc4XrXvt7DwNjS',
              unitAmount: 1200,
              recurringInterval: 'Month',
              creditAmount: null,
              isSellable: true,
            },
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_1RyF4BQh1LFc4XrXK0QSeC7f',
              unitAmount: 10800,
              recurringInterval: 'Year',
              creditAmount: null,
              isSellable: true,
            },
          ],
        },
      ],
      resourceCreditProducts: [],
    },
    {
      __typename: 'BillingPlan',
      planKey: 'ENTERPRISE',
      isSellable: true,
      isCheckoutDefault: false,
      upgradePlanKeys: [],
      downgradePlanKeys: ['PRO'],
      baseProducts: [
        {
          __typename: 'BillingLicensedProduct',
          name: 'Organization Plan',
          description: 'One seat',
          images: [],
          metadata: {
            __typename: 'BillingProductMetadata',
            isLegacy: null,
            productKey: 'BASE_PRODUCT',
            planKey: 'ENTERPRISE',
          },
          prices: [
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_1RyF49Qh1LFc4XrX2W6yGRpc',
              unitAmount: 2500,
              recurringInterval: 'Month',
              creditAmount: null,
              isSellable: true,
            },
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_1RyF48Qh1LFc4XrXw5Tr704k',
              unitAmount: 22800,
              recurringInterval: 'Year',
              creditAmount: null,
              isSellable: true,
            },
          ],
        },
      ],
      resourceCreditProducts: [],
    },
    {
      __typename: 'BillingPlan',
      planKey: 'PRO_V2',
      isSellable: false,
      isCheckoutDefault: false,
      upgradePlanKeys: [],
      downgradePlanKeys: [],
      baseProducts: [],
      resourceCreditProducts: [],
    },
    {
      __typename: 'BillingPlan',
      planKey: 'ORGANIZATION_V2',
      isSellable: false,
      isCheckoutDefault: false,
      upgradePlanKeys: [],
      downgradePlanKeys: [],
      baseProducts: [],
      resourceCreditProducts: [],
    },
  ],
} as ListPlansQuery;
