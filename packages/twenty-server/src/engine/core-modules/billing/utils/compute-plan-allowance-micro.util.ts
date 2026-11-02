/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { type FlatBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { findActiveWorkspaceCreditAllowanceMicro } from 'src/engine/core-modules/billing/utils/find-active-workspace-credit-allowance-micro.util';

export const computePlanAllowanceMicro = ({
  planAllowanceMicro,
  includedWorkspaceCreditsMicro,
  workspaceCreditAllowances,
  interval,
  status,
  nowMs,
}: Pick<
  FlatBillingSubscription,
  'planAllowanceMicro' | 'includedWorkspaceCreditsMicro' | 'interval' | 'status'
> &
  Partial<Pick<FlatBillingSubscription, 'workspaceCreditAllowances'>> & {
    nowMs: number;
  }): number | null => {
  const workspaceCreditAllowanceMicro = findActiveWorkspaceCreditAllowanceMicro(
    {
      // Entries cached before this field existed lack it until recomputed
      workspaceCreditAllowances: workspaceCreditAllowances ?? [],
      nowMs,
      interval,
      isTrialing: status === SubscriptionStatus.Trialing,
    },
  );

  if (!isDefined(workspaceCreditAllowanceMicro)) {
    return planAllowanceMicro;
  }

  return (
    (planAllowanceMicro ?? 0) -
    includedWorkspaceCreditsMicro +
    workspaceCreditAllowanceMicro
  );
};
