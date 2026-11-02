/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { type BillingArrangementPeriod } from 'src/engine/core-modules/billing/types/billing-arrangement-period.type';
import { type StripeCouponDiscount } from 'src/engine/core-modules/billing/types/stripe-coupon-discount.type';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';
import { isBillingArrangementActive } from 'src/engine/core-modules/billing/utils/is-billing-arrangement-active.util';

type DiscountArrangement = BillingArrangementPeriod &
  Pick<BillingArrangementEntity, 'id' | 'stripeCouponId'>;

type DiscountArrangementSync = {
  arrangementIdsToEnd: string[];
  arrangementEndsAtUpdate: {
    arrangementId: string;
    endsAt: Date | null;
  } | null;
  discountToRecord: StripeCouponDiscount | null;
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
  stripeCouponDiscounts,
  now,
}: {
  discountArrangements: DiscountArrangement[];
  stripeCouponDiscounts: StripeCouponDiscount[];
  now: Date;
}): DiscountArrangementSync => {
  const activeArrangements = discountArrangements.filter((arrangement) =>
    isBillingArrangementActive({ arrangement, now }),
  );

  const liveDiscounts = stripeCouponDiscounts.filter(
    ({ endsAt }) => !isDefined(endsAt) || endsAt > now,
  );

  const discount =
    liveDiscounts.find(({ stripeCouponId }) =>
      activeArrangements.some(
        (arrangement) => arrangement.stripeCouponId === stripeCouponId,
      ),
    ) ?? liveDiscounts[0];

  if (!isDefined(discount)) {
    return {
      arrangementIdsToEnd: activeArrangements.map(({ id }) => id),
      arrangementEndsAtUpdate: null,
      discountToRecord: null,
    };
  }

  const matchingArrangement = activeArrangements.find(
    ({ stripeCouponId }) => stripeCouponId === discount.stripeCouponId,
  );

  const arrangementIdsToEnd = activeArrangements
    .filter(({ id }) => id !== matchingArrangement?.id)
    .map(({ id }) => id);

  if (isDefined(matchingArrangement)) {
    return {
      arrangementIdsToEnd,
      arrangementEndsAtUpdate: isSameDate(
        matchingArrangement.endsAt,
        discount.endsAt,
      )
        ? null
        : { arrangementId: matchingArrangement.id, endsAt: discount.endsAt },
      discountToRecord: null,
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
    arrangementEndsAtUpdate: null,
    discountToRecord: {
      ...discount,
      startsAt:
        isDefined(latestArrangementEndDate) &&
        latestArrangementEndDate > discount.startsAt
          ? latestArrangementEndDate
          : discount.startsAt,
    },
  };
};
