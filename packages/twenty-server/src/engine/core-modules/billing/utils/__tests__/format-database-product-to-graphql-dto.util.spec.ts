/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingPriceTiersMode } from 'src/engine/core-modules/billing/enums/billing-price-tiers-mode.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { BillingGetPlanResult } from 'src/engine/core-modules/billing/types/billing-get-plan-result.type';
import { formatBillingDatabaseProductToGraphqlDTO } from 'src/engine/core-modules/billing/utils/format-database-product-to-graphql-dto.util';

describe('formatBillingDatabaseProductToGraphqlDTO', () => {
  it('should format a complete billing plan correctly', () => {
    const mockPlan = {
      planKey: BillingPlanKey.PRO,
      baseProduct: {
        id: 'base-1',
        name: 'Base Product',
        billingPrices: [
          {
            interval: SubscriptionInterval.Month,
            unitAmount: 1000,
            stripePriceId: 'price_base1',
            priceUsageType: BillingUsageType.LICENSED,
          },
        ],
      },
      otherLicensedProducts: [
        {
          id: 'licensed-1',
          name: 'Licensed Product',
          billingPrices: [
            {
              interval: SubscriptionInterval.Year,
              unitAmount: 2000,
              stripePriceId: 'price_licensed1',
              priceUsageType: BillingUsageType.LICENSED,
            },
          ],
        },
      ],
      meteredProducts: [
        {
          id: 'metered-1',
          name: 'Metered Product',
          billingPrices: [
            {
              interval: SubscriptionInterval.Month,
              tiersMode: BillingPriceTiersMode.GRADUATED,
              tiers: [
                {
                  up_to: 10,
                  flat_amount: 1000,
                  unit_amount: 100,
                },
              ],
              stripePriceId: 'price_metered1',
              priceUsageType: BillingUsageType.METERED,
            },
          ],
        },
      ],
    };

    const result = formatBillingDatabaseProductToGraphqlDTO(
      mockPlan as unknown as BillingGetPlanResult,
    );

    expect(result).toEqual({
      planKey: BillingPlanKey.PRO,
      baseProduct: {
        id: 'base-1',
        metadata: {
          priceUsageBased: BillingUsageType.LICENSED,
        },
        name: 'Base Product',
        billingPrices: [
          {
            interval: SubscriptionInterval.Month,
            unitAmount: 1000,
            stripePriceId: 'price_base1',
            priceUsageType: BillingUsageType.LICENSED,
          },
        ],
        prices: [
          {
            recurringInterval: SubscriptionInterval.Month,
            unitAmount: 1000,
            stripePriceId: 'price_base1',
            priceUsageType: BillingUsageType.LICENSED,
          },
        ],
      },
      otherLicensedProducts: [
        {
          id: 'licensed-1',
          metadata: {
            priceUsageBased: BillingUsageType.LICENSED,
          },
          name: 'Licensed Product',
          billingPrices: [
            {
              interval: SubscriptionInterval.Year,
              unitAmount: 2000,
              stripePriceId: 'price_licensed1',
              priceUsageType: BillingUsageType.LICENSED,
            },
          ],
          prices: [
            {
              recurringInterval: SubscriptionInterval.Year,
              unitAmount: 2000,
              stripePriceId: 'price_licensed1',
              priceUsageType: BillingUsageType.LICENSED,
            },
          ],
        },
      ],
      meteredProducts: [
        {
          id: 'metered-1',
          metadata: {
            priceUsageBased: BillingUsageType.METERED,
          },
          name: 'Metered Product',
          billingPrices: [
            {
              interval: SubscriptionInterval.Month,
              tiersMode: BillingPriceTiersMode.GRADUATED,
              tiers: [
                {
                  up_to: 10,
                  flat_amount: 1000,
                  unit_amount: 100,
                },
              ],
              stripePriceId: 'price_metered1',
              priceUsageType: BillingUsageType.METERED,
            },
          ],
          prices: [
            {
              tiersMode: BillingPriceTiersMode.GRADUATED,
              tiers: [
                {
                  upTo: 10,
                  flatAmount: 1000,
                  unitAmount: 100,
                },
              ],
              recurringInterval: SubscriptionInterval.Month,
              stripePriceId: 'price_metered1',
              priceUsageType: BillingUsageType.METERED,
            },
          ],
        },
      ],
    });
  });

  it('should handle empty products and null values', () => {
    const mockPlan = {
      planKey: 'empty-plan',
      baseProduct: {
        id: 'base-1',
        name: 'Base Product',
        billingPrices: [
          {
            interval: null,
            unitAmount: null,
            stripePriceId: null,
            priceUsageType: BillingUsageType.LICENSED,
          },
        ],
      },
      otherLicensedProducts: [],
      meteredProducts: [
        {
          id: 'metered-1',
          name: 'Metered Product',
          billingPrices: [
            {
              interval: null,
              tiersMode: null,
              tiers: null,
              stripePriceId: null,
              priceUsageType: BillingUsageType.METERED,
            },
          ],
        },
      ],
    };

    const result = formatBillingDatabaseProductToGraphqlDTO(
      mockPlan as unknown as BillingGetPlanResult,
    );

    expect(result).toEqual({
      planKey: 'empty-plan',
      baseProduct: {
        id: 'base-1',
        metadata: {
          priceUsageBased: BillingUsageType.LICENSED,
        },
        name: 'Base Product',
        billingPrices: [
          {
            interval: null,
            unitAmount: null,
            stripePriceId: null,
            priceUsageType: BillingUsageType.LICENSED,
          },
        ],
        prices: [
          {
            recurringInterval: SubscriptionInterval.Month,
            unitAmount: 0,
            stripePriceId: null,
            priceUsageType: BillingUsageType.LICENSED,
          },
        ],
      },
      otherLicensedProducts: [],
      meteredProducts: [
        {
          id: 'metered-1',
          metadata: {
            priceUsageBased: BillingUsageType.METERED,
          },
          name: 'Metered Product',
          billingPrices: [
            {
              interval: null,
              tiersMode: null,
              tiers: null,
              stripePriceId: null,
              priceUsageType: BillingUsageType.METERED,
            },
          ],
          prices: [
            {
              tiersMode: null,
              tiers: [],
              recurringInterval: SubscriptionInterval.Month,
              stripePriceId: null,
              priceUsageType: BillingUsageType.METERED,
            },
          ],
        },
      ],
    });
  });
});
