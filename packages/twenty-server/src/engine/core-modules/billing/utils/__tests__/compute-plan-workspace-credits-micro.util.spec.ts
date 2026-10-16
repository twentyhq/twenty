/* @license Enterprise */

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { computePlanWorkspaceCreditsMicro } from 'src/engine/core-modules/billing/utils/compute-plan-workspace-credits-micro.util';

const buildBaseItem = ({
  seats,
  workspaceCreditsPerSeat,
}: {
  seats: number;
  workspaceCreditsPerSeat?: string;
}) => ({
  stripePriceId: 'price_base',
  quantity: seats,
  billingProduct: {
    metadata: {
      productKey: BillingProductKey.BASE_PRODUCT,
      workspaceCreditsPerSeat,
    },
  },
});

const buildPackItem = (creditAmount: string) => ({
  stripePriceId: 'price_pack',
  quantity: 1,
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
});

describe('computePlanWorkspaceCreditsMicro', () => {
  it('only counts the pack when the plan gives no credits per seat', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [
          buildBaseItem({ seats: 5 }),
          buildPackItem('50'),
        ],
        interval: SubscriptionInterval.Month,
        peakSeats: 5,
      }),
    ).toEqual({
      seats: 5,
      workspaceCreditsForSeatsMicro: 0,
      workspaceCreditsForPackMicro: 50,
    });
  });

  it('adds the credits of every seat to the pack', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [
          buildBaseItem({ seats: 5, workspaceCreditsPerSeat: '4' }),
          buildPackItem('50'),
        ],
        interval: SubscriptionInterval.Month,
        peakSeats: 5,
      }),
    ).toEqual({
      seats: 5,
      workspaceCreditsForSeatsMicro: 20,
      workspaceCreditsForPackMicro: 50,
    });
  });

  it('keeps the credits of seats removed during the period', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [
          buildBaseItem({ seats: 6, workspaceCreditsPerSeat: '4' }),
          buildPackItem('50'),
        ],
        interval: SubscriptionInterval.Month,
        peakSeats: 8,
      }),
    ).toMatchObject({ seats: 8, workspaceCreditsForSeatsMicro: 32 });
  });

  it('ignores seats added after a closed period', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [
          buildBaseItem({ seats: 8, workspaceCreditsPerSeat: '4' }),
          buildPackItem('50'),
        ],
        interval: SubscriptionInterval.Month,
        peakSeats: 5,
      }),
    ).toMatchObject({ seats: 5, workspaceCreditsForSeatsMicro: 20 });
  });

  it('falls back to the live seats when no peak is recorded yet', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [
          buildBaseItem({ seats: 5, workspaceCreditsPerSeat: '4' }),
          buildPackItem('50'),
        ],
        interval: SubscriptionInterval.Month,
        peakSeats: null,
      }),
    ).toMatchObject({ seats: 5, workspaceCreditsForSeatsMicro: 20 });
  });

  it('gives twelve months of seat credits on a yearly plan', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [
          buildBaseItem({ seats: 5, workspaceCreditsPerSeat: '4' }),
          buildPackItem('600'),
        ],
        interval: SubscriptionInterval.Year,
        peakSeats: 5,
      }),
    ).toEqual({
      seats: 5,
      workspaceCreditsForSeatsMicro: 240,
      workspaceCreditsForPackMicro: 600,
    });
  });

  it('gives seat credits next to a free pack', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [
          buildBaseItem({ seats: 5, workspaceCreditsPerSeat: '4' }),
          buildPackItem('0'),
        ],
        interval: SubscriptionInterval.Month,
        peakSeats: 5,
      }),
    ).toEqual({
      seats: 5,
      workspaceCreditsForSeatsMicro: 20,
      workspaceCreditsForPackMicro: 0,
    });
  });

  it('gives seat credits without any pack', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [
          buildBaseItem({ seats: 5, workspaceCreditsPerSeat: '4' }),
        ],
        interval: SubscriptionInterval.Month,
        peakSeats: 5,
      }),
    ).toEqual({
      seats: 5,
      workspaceCreditsForSeatsMicro: 20,
      workspaceCreditsForPackMicro: 0,
    });
  });

  it('returns null when neither the pack nor the seats give credits', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [buildBaseItem({ seats: 5 })],
        interval: SubscriptionInterval.Month,
        peakSeats: 5,
      }),
    ).toBeNull();
  });

  it('ignores a per-seat amount that is not a positive number', () => {
    expect(
      computePlanWorkspaceCreditsMicro({
        billingSubscriptionItems: [
          buildBaseItem({ seats: 5, workspaceCreditsPerSeat: 'lots' }),
          buildPackItem('50'),
        ],
        interval: SubscriptionInterval.Month,
        peakSeats: 5,
      }),
    ).toMatchObject({ workspaceCreditsForSeatsMicro: 0 });
  });
});
