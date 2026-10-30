/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { ONE_TIME_BILLING_ARRANGEMENT_TYPES } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type BillingArrangementPeriod } from 'src/engine/core-modules/billing/types/billing-arrangement-period.type';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';

const isBefore = ({
  date,
  endDate,
}: {
  date: Date;
  endDate: Date | null;
}): boolean => !isDefined(endDate) || date < endDate;

const isNeverActive = (period: BillingArrangementPeriod): boolean =>
  !isBefore({
    date: period.startsAt,
    endDate: getBillingArrangementEndDate(period),
  });

export const findOverlappingBillingArrangement = <
  TArrangement extends BillingArrangementPeriod,
>({
  arrangement,
  workspaceArrangements,
}: {
  arrangement: BillingArrangementPeriod;
  workspaceArrangements: TArrangement[];
}): TArrangement | undefined => {
  if (
    ONE_TIME_BILLING_ARRANGEMENT_TYPES.includes(arrangement.type) ||
    isNeverActive(arrangement)
  ) {
    return undefined;
  }

  const endDate = getBillingArrangementEndDate(arrangement);

  return workspaceArrangements.find(
    (existingArrangement) =>
      existingArrangement.type === arrangement.type &&
      !isNeverActive(existingArrangement) &&
      isBefore({ date: existingArrangement.startsAt, endDate }) &&
      isBefore({
        date: arrangement.startsAt,
        endDate: getBillingArrangementEndDate(existingArrangement),
      }),
  );
};
