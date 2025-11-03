import type { ListPlansQueryResult } from '~/generated-metadata/graphql';

export const mockBillingPlans = {
  listPlans: [
    {
      __typename: 'BillingPlanOutput',
      planKey: 'PRO',
      licensedProducts: [
        {
          __typename: 'BillingLicensedProduct',
          name: 'Pro Plan',
          description: 'For growing teams',
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
              stripePriceId: 'price_1RyF4BQh1LFc4XrXvt7DwNjS',
              unitAmount: 1200,
              recurringInterval: 'Month',
              priceUsageType: 'LICENSED',
            },
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_1RyF4BQh1LFc4XrXK0QSeC7f',
              unitAmount: 10800,
              recurringInterval: 'Year',
              priceUsageType: 'LICENSED',
            },
          ],
        },
      ],
      meteredProducts: [
        {
          __typename: 'BillingMeteredProduct',
          name: 'Workflow Execution - Pro',
          description: '',
          images: [],
          metadata: {
            __typename: 'BillingProductMetadata',
            productKey: 'WORKFLOW_NODE_EXECUTION',
            planKey: 'PRO',
            priceUsageBased: 'METERED',
          },
          prices: [
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Year',
              stripePriceId: 'price_1S5247Qh1LFc4XrXz7p0wdAc',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 999000,
                  unitAmount: null,
                  upTo: 7500000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Year',
              stripePriceId: 'price_1S5246Qh1LFc4XrX2SdtgqXV',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 399000,
                  unitAmount: null,
                  upTo: 2600000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Year',
              stripePriceId: 'price_1S5246Qh1LFc4XrXs78BMPQ9',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 199000,
                  unitAmount: null,
                  upTo: 1200000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Year',
              stripePriceId: 'price_1S5246Qh1LFc4XrXyMEu78zC',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 99000,
                  unitAmount: null,
                  upTo: 540000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Year',
              stripePriceId: 'price_1S5245Qh1LFc4XrXcNX3ZHn2',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 29000,
                  unitAmount: null,
                  upTo: 130000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Year',
              stripePriceId: 'price_1S5245Qh1LFc4XrXBSZDK2pI',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 0,
                  unitAmount: null,
                  upTo: 50000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Month',
              stripePriceId: 'price_1S5245Qh1LFc4XrXPCSjYIq0',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 99900,
                  unitAmount: null,
                  upTo: 700000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Month',
              stripePriceId: 'price_1S5244Qh1LFc4XrXswQAQfQh',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 39900,
                  unitAmount: null,
                  upTo: 240000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Month',
              stripePriceId: 'price_1S5244Qh1LFc4XrXB8yPMpce',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 19900,
                  unitAmount: null,
                  upTo: 110000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Month',
              stripePriceId: 'price_1S5244Qh1LFc4XrXa5wYhu1M',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 9900,
                  unitAmount: null,
                  upTo: 50000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Month',
              stripePriceId: 'price_1S5243Qh1LFc4XrX1rtoEZD3',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 2900,
                  unitAmount: null,
                  upTo: 10000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Month',
              stripePriceId: 'price_1S5243Qh1LFc4XrXaeDkjNQq',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 0,
                  unitAmount: null,
                  upTo: 5000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      __typename: 'BillingPlanOutput',
      planKey: 'ENTERPRISE',
      licensedProducts: [
        {
          __typename: 'BillingLicensedProduct',
          name: 'Organization Plan',
          description: 'One seat',
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
              stripePriceId: 'price_1RyF49Qh1LFc4XrX2W6yGRpc',
              unitAmount: 2500,
              recurringInterval: 'Month',
              priceUsageType: 'LICENSED',
            },
            {
              __typename: 'BillingPriceLicensed',
              stripePriceId: 'price_1RyF48Qh1LFc4XrXw5Tr704k',
              unitAmount: 22800,
              recurringInterval: 'Year',
              priceUsageType: 'LICENSED',
            },
          ],
        },
      ],
      meteredProducts: [
        {
          __typename: 'BillingMeteredProduct',
          name: 'Workflow Execution - Organization',
          description: '',
          images: [],
          metadata: {
            __typename: 'BillingProductMetadata',
            productKey: 'WORKFLOW_NODE_EXECUTION',
            planKey: 'ENTERPRISE',
            priceUsageBased: 'METERED',
          },
          prices: [
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Year',
              stripePriceId: 'price_1S4GiuQh1LFc4XrX9IZ68tqy',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 999000,
                  unitAmount: null,
                  upTo: 7500000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Year',
              stripePriceId: 'price_1S4GirQh1LFc4XrXJxV0yJEX',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 399000,
                  unitAmount: null,
                  upTo: 2600000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Year',
              stripePriceId: 'price_1S4GirQh1LFc4XrX6fK2qrQm',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 199000,
                  unitAmount: null,
                  upTo: 1200000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Year',
              stripePriceId: 'price_1S4GipQh1LFc4XrXeamfdifM',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 99000,
                  unitAmount: null,
                  upTo: 540000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Year',
              stripePriceId: 'price_1S4GipQh1LFc4XrXKxrUDfnE',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 29000,
                  unitAmount: null,
                  upTo: 130000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Year',
              stripePriceId: 'price_1S4GioQh1LFc4XrXMTbLurFo',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 0,
                  unitAmount: null,
                  upTo: 50000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Month',
              stripePriceId: 'price_1S4GinQh1LFc4XrXP3sgt8Cn',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 99900,
                  unitAmount: null,
                  upTo: 700000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Month',
              stripePriceId: 'price_1S4GigQh1LFc4XrXGsuGslfk',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 39900,
                  unitAmount: null,
                  upTo: 240000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Month',
              stripePriceId: 'price_1S4GifQh1LFc4XrXCsT2PvH2',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 19900,
                  unitAmount: null,
                  upTo: 110000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Month',
              stripePriceId: 'price_1S4GifQh1LFc4XrXZ0ZIrjeM',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 9900,
                  unitAmount: null,
                  upTo: 50000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Month',
              stripePriceId: 'price_1S4GieQh1LFc4XrX8njwswjQ',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 2900,
                  unitAmount: null,
                  upTo: 10000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
            {
              __typename: 'BillingPriceMetered',
              priceUsageType: 'METERED',
              recurringInterval: 'Month',
              stripePriceId: 'price_1S4GieQh1LFc4XrXDpVbLuuE',
              tiers: [
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: 0,
                  unitAmount: null,
                  upTo: 5000000,
                },
                {
                  __typename: 'BillingPriceTier',
                  flatAmount: null,
                  unitAmount: null,
                  upTo: null,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
} as NonNullable<ListPlansQueryResult['data']>;
