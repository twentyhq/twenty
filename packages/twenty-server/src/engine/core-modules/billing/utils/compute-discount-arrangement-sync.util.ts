/* @license Enterprise */

import uniqBy from 'lodash.uniqby';
import { isDefined } from 'twenty-shared/utils';

import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { type BillingArrangementPeriod } from 'src/engine/core-modules/billing/types/billing-arrangement-period.type';
import { type StripeDiscount } from 'src/engine/core-modules/billing/types/stripe-discount.type';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';
import { isBillingArrangementActive } from 'src/engine/core-modules/billing/utils/is-billing-arrangement-active.util';

type DiscountArrangement = BillingArrangementPeriod &
  Pick<BillingArrangementEntity, 'id' | 'stripeDiscountId'>;

type DiscountArrangementSync = {
  arrangementIdsToEnd: string[];
  arrangementEndsAtUpdates: {
    arrangementId: string;
    endsAt: Date | null;
  }[];
  discountToRecord: StripeDiscount | null;
  unmirroredStripeDiscountIds: string[];
};

const isSameDate = (dateA: Date | null, dateB: Date | null): boolean =>
  dateA?.getTime() === dateB?.getTime();

const getLatestDate = (dates: Date[]): Date | null =>
  dates.reduce<Date | null>(
    (latestDate, date) =>
      !isDefined(latestDate) || date > latestDate ? date : latestDate,
    null,
  );

export const computeDiscountArrangementSync = ({
  discountArrangements,
  stripeDiscounts,
  now,
}: {
  discountArrangements: DiscountArrangement[];
  stripeDiscounts: StripeDiscount[];
  now: Date;
}): DiscountArrangementSync => {
  const activeArrangements = discountArrangements.filter((arrangement) =>
    isBillingArrangementActive({ arrangement, now }),
  );

  // A subscription can reuse its customer's discount, which then shows up twice
  const liveDiscounts = uniqBy(
    stripeDiscounts.filter(({ endsAt }) => !isDefined(endsAt) || endsAt > now),
    'stripeDiscountId',
  );

  const findLiveDiscount = (stripeDiscountId: string | null) =>
    liveDiscounts.find(
      (discount) => discount.stripeDiscountId === stripeDiscountId,
    );

  const keptArrangements = activeArrangements.filter(({ stripeDiscountId }) =>
    isDefined(findLiveDiscount(stripeDiscountId)),
  );

  const arrangementIdsToEnd = activeArrangements
    .filter((arrangement) => !keptArrangements.includes(arrangement))
    .map(({ id }) => id);

  const arrangementEndsAtUpdates = keptArrangements.flatMap((arrangement) => {
    const endsAt =
      findLiveDiscount(arrangement.stripeDiscountId)?.endsAt ?? null;

    return isSameDate(arrangement.endsAt, endsAt)
      ? []
      : [{ arrangementId: arrangement.id, endsAt }];
  });

  const recordedStripeDiscountIds = discountArrangements.map(
    ({ stripeDiscountId }) => stripeDiscountId,
  );

  const unrecordedDiscount =
    keptArrangements.length === 0
      ? liveDiscounts.find(
          ({ stripeDiscountId }) =>
            !recordedStripeDiscountIds.includes(stripeDiscountId),
        )
      : undefined;

  const mirroredStripeDiscountIds = [
    ...keptArrangements.map(({ stripeDiscountId }) => stripeDiscountId),
    unrecordedDiscount?.stripeDiscountId,
  ];

  const unmirroredStripeDiscountIds = liveDiscounts
    .map(({ stripeDiscountId }) => stripeDiscountId)
    .filter(
      (stripeDiscountId) =>
        !mirroredStripeDiscountIds.includes(stripeDiscountId),
    );

  if (!isDefined(unrecordedDiscount)) {
    return {
      arrangementIdsToEnd,
      arrangementEndsAtUpdates,
      discountToRecord: null,
      unmirroredStripeDiscountIds,
    };
  }

  const latestArrangementEndDate = getLatestDate(
    discountArrangements
      .map((arrangement) =>
        arrangementIdsToEnd.includes(arrangement.id)
          ? now
          : getBillingArrangementEndDate(arrangement),
      )
      .filter(isDefined),
  );

  return {
    arrangementIdsToEnd,
    arrangementEndsAtUpdates,
    discountToRecord: {
      ...unrecordedDiscount,
      startsAt:
        isDefined(latestArrangementEndDate) &&
        latestArrangementEndDate > unrecordedDiscount.startsAt
          ? latestArrangementEndDate
          : unrecordedDiscount.startsAt,
    },
    unmirroredStripeDiscountIds,
  };
};
