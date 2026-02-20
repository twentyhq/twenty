/* @license Enterprise */
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { formatBillingDatabaseProductToGraphqlDTO } from 'src/engine/core-modules/billing/utils/format-database-product-to-graphql-dto.util';
import type { BillingGetPlanResult } from 'src/engine/core-modules/billing/types/billing-get-plan-result.type';

describe('formatBillingDatabaseProductToGraphqlDTO', () => {
  it('should correctly format a billing plan with licensed and metered products', () => {
    const mockPlan = {
      planKey: BillingPlanKey.PRO,
      licensedProducts: [
        {
          id: 'product-1',
          name: 'Test Licensed Product',
          billingPrices: [
            {
              interval: SubscriptionInterval.Month,
              unitAmount: 1500,
              stripePriceId: 'price_123',
              priceUsageType: BillingUsageType.LICENSED,
            },
          ],
        },
      ],
      meteredProducts: [
        {
          id: 'product-2',
          name: 'Test Metered Product',
          billingPrices: [
            {
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 10000000,
                  flat_amount: 500,
                  unit_amount: null,
                },
                { up_to: null, flat_amount: null, unit_amount: 0.001 },
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
      licensedProducts: [
        {
          id: 'product-1',
          name: 'Test Licensed Product',
          billingPrices: [
            {
              interval: SubscriptionInterval.Month,
              unitAmount: 1500,
              stripePriceId: 'price_123',
              priceUsageType: BillingUsageType.LICENSED,
            },
          ],
          prices: [
            {
              recurringInterval: SubscriptionInterval.Month,
              unitAmount: 1500,
              stripePriceId: 'price_123',
              priceUsageType: BillingUsageType.LICENSED,
            },
          ],
        },
      ],
      meteredProducts: [
        {
          id: 'product-2',
          metadata: {
            priceUsageBased: 'METERED',
          },
          name: 'Test Metered Product',
          billingPrices: [
            {
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 10000000,
                  flat_amount: 500,
                  unit_amount: null,
                },
                { up_to: null, flat_amount: null, unit_amount: 0.001 },
              ],
              stripePriceId: 'price_metered1',
              priceUsageType: BillingUsageType.METERED,
            },
          ],
          prices: [
            {
              tiers: [
                { upTo: 10000, flatAmount: 500, unitAmount: null },
                { upTo: null, flatAmount: null, unitAmount: 0.001 },
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

  it('should convert internal credits to display credits in metered tier upTo', () => {
    const mockPlan = {
      planKey: BillingPlanKey.PRO,
      licensedProducts: [],
      meteredProducts: [
        {
          id: 'product-2',
          name: 'Test Metered Product',
          billingPrices: [
            {
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 50000000,
                  flat_amount: 0,
                  unit_amount: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
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

    const meteredPrices = result.meteredProducts[0].prices;

    expect(meteredPrices![0].tiers[0]).toEqual(
      expect.objectContaining({ upTo: 50000 }),
    );
    expect(meteredPrices![0].tiers[1]).toEqual(
      expect.objectContaining({ upTo: null }),
    );
  });
});
