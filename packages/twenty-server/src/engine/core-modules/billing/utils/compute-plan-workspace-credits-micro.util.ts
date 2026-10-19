/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { isBaseProductSubscriptionItem } from 'src/engine/core-modules/billing/utils/is-base-product-subscription-item.util';

export type PlanWorkspaceCreditsMicro = {
  workspaceCreditsForSeatsMicro: number;
  workspaceCreditsForPackMicro: number;
};

const toPositiveAmount = (value: string | undefined): number => {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

export const computePlanWorkspaceCreditsMicro = ({
  billingSubscriptionItems,
  interval,
  seats,
}: Pick<BillingSubscriptionEntity, 'billingSubscriptionItems' | 'interval'> & {
  seats: number;
}): PlanWorkspaceCreditsMicro | null => {
  const baseProductItem = billingSubscriptionItems.find(
    isBaseProductSubscriptionItem,
  );
  const resourceCreditItem = billingSubscriptionItems.find(
    ({ billingProduct }) =>
      billingProduct?.metadata?.productKey ===
      BillingProductKey.RESOURCE_CREDIT,
  );
  const resourceCreditPrice =
    resourceCreditItem?.billingProduct?.billingPrices?.find(
      ({ stripePriceId }) => stripePriceId === resourceCreditItem.stripePriceId,
    );

  const workspaceCreditsForSeatsMicro =
    toPositiveAmount(
      baseProductItem?.billingProduct?.metadata?.workspaceCreditsPerSeat,
    ) *
    seats *
    (interval === SubscriptionInterval.Year ? 12 : 1);

  if (!isDefined(resourceCreditPrice) && workspaceCreditsForSeatsMicro === 0) {
    return null;
  }

  return {
    workspaceCreditsForSeatsMicro,
    workspaceCreditsForPackMicro: toPositiveAmount(
      resourceCreditPrice?.metadata?.credit_amount,
    ),
  };
};
