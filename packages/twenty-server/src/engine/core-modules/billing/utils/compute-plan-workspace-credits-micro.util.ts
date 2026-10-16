/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { type BillingPriceMetadata } from 'src/engine/core-modules/billing/types/billing-price-metadata.type';
import { type BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';

type PlanSubscriptionItem = Pick<
  BillingSubscriptionItemEntity,
  'stripePriceId' | 'quantity'
> & {
  billingProduct?: {
    metadata?: Pick<
      BillingProductMetadata,
      'productKey' | 'workspaceCreditsPerSeat'
    > | null;
    billingPrices?: {
      stripePriceId: string;
      metadata?: Pick<BillingPriceMetadata, 'credit_amount'> | null;
    }[];
  } | null;
};

export type PlanWorkspaceCreditsMicro = {
  seats: number;
  workspaceCreditsForSeatsMicro: number;
  workspaceCreditsForPackMicro: number;
};

const MONTHS_PER_YEAR = 12;

const toPositiveAmount = (value: string | undefined): number => {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

const findItemByProductKey = (
  billingSubscriptionItems: PlanSubscriptionItem[],
  productKey: BillingProductKey,
): PlanSubscriptionItem | undefined =>
  billingSubscriptionItems.find(
    (item) => item.billingProduct?.metadata?.productKey === productKey,
  );

export const computePlanWorkspaceCreditsMicro = ({
  billingSubscriptionItems,
  interval,
  peakSeats,
}: {
  billingSubscriptionItems: PlanSubscriptionItem[];
  interval: SubscriptionInterval | null | undefined;
  peakSeats: number | null;
}): PlanWorkspaceCreditsMicro | null => {
  const baseProductItem = findItemByProductKey(
    billingSubscriptionItems,
    BillingProductKey.BASE_PRODUCT,
  );
  const resourceCreditItem = findItemByProductKey(
    billingSubscriptionItems,
    BillingProductKey.RESOURCE_CREDIT,
  );
  const resourceCreditPrice =
    resourceCreditItem?.billingProduct?.billingPrices?.find(
      (price) => price.stripePriceId === resourceCreditItem.stripePriceId,
    );

  const seats = Math.max(baseProductItem?.quantity ?? 0, peakSeats ?? 0);
  const workspaceCreditsPerSeatMicro = toPositiveAmount(
    baseProductItem?.billingProduct?.metadata?.workspaceCreditsPerSeat,
  );
  const monthsPerPeriod =
    interval === SubscriptionInterval.Year ? MONTHS_PER_YEAR : 1;
  const workspaceCreditsForSeatsMicro =
    workspaceCreditsPerSeatMicro * seats * monthsPerPeriod;

  if (!isDefined(resourceCreditPrice) && workspaceCreditsForSeatsMicro === 0) {
    return null;
  }

  return {
    seats,
    workspaceCreditsForSeatsMicro,
    workspaceCreditsForPackMicro: toPositiveAmount(
      resourceCreditPrice?.metadata?.credit_amount,
    ),
  };
};
