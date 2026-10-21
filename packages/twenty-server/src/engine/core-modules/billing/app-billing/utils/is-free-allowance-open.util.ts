/* @license Enterprise */

import { type BillableOperationFreeAllowance } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// Says nothing of the quantity bound, which needs the usage already charged
export const isFreeAllowanceOpen = ({
  freeAllowance,
  installedAt,
  workspaceCreatedAt,
  now,
}: {
  freeAllowance: BillableOperationFreeAllowance;
  installedAt: Date;
  workspaceCreatedAt: Date;
  now: Date;
}): boolean => {
  if (
    isDefined(freeAllowance.workspaceCreatedFrom) &&
    workspaceCreatedAt.getTime() <
      Date.parse(freeAllowance.workspaceCreatedFrom)
  ) {
    return false;
  }

  return (
    !isDefined(freeAllowance.durationInDays) ||
    now.getTime() <
      installedAt.getTime() +
        freeAllowance.durationInDays * MILLISECONDS_PER_DAY
  );
};
