/* @license Enterprise */

import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { computePlanWorkspaceCreditsMicro } from 'src/engine/core-modules/billing/utils/compute-plan-workspace-credits-micro.util';

const buildBaseItem = (workspaceCreditsPerSeat?: string) =>
  ({
    stripePriceId: 'price_base',
    billingProduct: {
      metadata: {
        productKey: BillingProductKey.BASE_PRODUCT,
        workspaceCreditsPerSeat,
      },
    },
  }) as BillingSubscriptionItemEntity;

const buildPackItem = (creditAmount: string) =>
  ({
    stripePriceId: 'price_pack',
    billingProduct: {
      metadata: { productKey: BillingProductKey.RESOURCE_CREDIT },
      billingPrices: [
        { stripePriceId: 'price_other_pack', metadata: { credit_amount: '1' } },
        {
          stripePriceId: 'price_pack',
          metadata: { credit_amount: creditAmount },
        },
      ],
    },
  }) as BillingSubscriptionItemEntity;

describe('computePlanWorkspaceCreditsMicro', () => {
  it('only counts the pack when the plan gives no credits per seat', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [buildBaseItem(), buildPackItem('50')],
        interval: SubscriptionInterval.Month,
        seats: 5,
      }),
    ).toEqual({
      workspaceCreditsForSeatsMicro: 0,
      workspaceCreditsForPackMicro: 50,
    });
  });

  it('adds the credits of every seat to the pack', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [buildBaseItem('4'), buildPackItem('50')],
        interval: SubscriptionInterval.Month,
        seats: 5,
      }),
    ).toEqual({
      workspaceCreditsForSeatsMicro: 20,
      workspaceCreditsForPackMicro: 50,
    });
  });

  it('gives twelve months of seat credits on a yearly plan', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [buildBaseItem('4'), buildPackItem('600')],
        interval: SubscriptionInterval.Year,
        seats: 5,
      }),
    ).toEqual({
      workspaceCreditsForSeatsMicro: 240,
      workspaceCreditsForPackMicro: 600,
    });
  });

  it('gives seat credits next to a free pack', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [buildBaseItem('4'), buildPackItem('0')],
        interval: SubscriptionInterval.Month,
        seats: 5,
      }),
    ).toEqual({
      workspaceCreditsForSeatsMicro: 20,
      workspaceCreditsForPackMicro: 0,
    });
  });

  it('gives seat credits without any pack', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [buildBaseItem('4')],
        interval: SubscriptionInterval.Month,
        seats: 5,
      }),
    ).toEqual({
      workspaceCreditsForSeatsMicro: 20,
      workspaceCreditsForPackMicro: 0,
    });
  });

  it('returns null when neither the pack nor the seats give credits', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [buildBaseItem()],
        interval: SubscriptionInterval.Month,
        seats: 5,
      }),
    ).toBeNull();
  });

  it('ignores a per-seat amount that is not a positive number', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [buildBaseItem('lots'), buildPackItem('50')],
        interval: SubscriptionInterval.Month,
        seats: 5,
      }),
    ).toMatchObject({ workspaceCreditsForSeatsMicro: 0 });
  });
});
