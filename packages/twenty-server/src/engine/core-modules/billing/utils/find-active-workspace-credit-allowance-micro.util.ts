/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { type WorkspaceCreditAllowanceWindow } from 'src/engine/core-modules/billing/types/workspace-credit-allowance-window.type';
import { isWithinBillingArrangementWindow } from 'src/engine/core-modules/billing/utils/is-within-billing-arrangement-window.util';

export const findActiveWorkspaceCreditAllowanceMicro = ({
  workspaceCreditAllowances,
  nowMs,
  interval,
  isTrialing,
}: {
  workspaceCreditAllowances: WorkspaceCreditAllowanceWindow[];
  nowMs: number;
  interval: SubscriptionInterval;
  isTrialing: boolean;
}): number | null => {
  const activeWorkspaceCreditAllowance = workspaceCreditAllowances.find(
    ({ startsAtMs, endsAtMs }) =>
      isWithinBillingArrangementWindow({ startsAtMs, endsAtMs, nowMs }),
  );

  if (!isDefined(activeWorkspaceCreditAllowance)) {
    return null;
  }

  const { creditAllowanceMicro } = activeWorkspaceCreditAllowance;

  return !isTrialing && interval === SubscriptionInterval.Year
    ? creditAllowanceMicro * 12
    : creditAllowanceMicro;
};
