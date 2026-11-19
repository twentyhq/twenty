/* @license Enterprise */
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { formatBillingDatabaseProductToGraphqlDTO } from 'src/engine/core-modules/billing/utils/format-database-product-to-graphql-dto.util';
import type { BillingGetPlanResult } from 'src/engine/core-modules/billing/types/billing-get-plan-result.type';

describe('formatBillingDatabaseProductToGraphqlDTO', () => {
  it('should correctly format a billing plan with licensed products', () => {
    const mockPlan = {
      planKey: BillingPlanKey.PRO,
      baseProducts: [
        {
          id: 'product-1',
          name: 'Test Licensed Product',
          billingPrices: [
            {
              active: true,
              interval: SubscriptionInterval.Month,
              unitAmount: 1500,
              stripePriceId: 'price_123',
            },
          ],
        },
      ],
      resourceCreditProducts: [],
    };

    const result = formatBillingDatabaseProductToGraphqlDTO(
      mockPlan as unknown as BillingGetPlanResult,
    );

    expect(result).toEqual({
      planKey: BillingPlanKey.PRO,
      baseProducts: [
        {
          id: 'product-1',
          name: 'Test Licensed Product',
          billingPrices: [
            {
              active: true,
              interval: SubscriptionInterval.Month,
              unitAmount: 1500,
              stripePriceId: 'price_123',
            },
          ],
          prices: [
            {
              recurringInterval: SubscriptionInterval.Month,
              unitAmount: 1500,
              stripePriceId: 'price_123',
              creditAmount: null,
              isSellable: true,
            },
          ],
        },
      ],
      resourceCreditProducts: [],
    });
  });
});
