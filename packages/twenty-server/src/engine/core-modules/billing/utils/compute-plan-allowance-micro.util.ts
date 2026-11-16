/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { type FlatBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { findActiveWorkspaceCreditAllowanceMicro } from 'src/engine/core-modules/billing/utils/find-active-workspace-credit-allowance-micro.util';

export const computePlanAllowanceMicro = ({
  planAllowanceMicro,
  workspaceCreditsForPackMicro,
  workspaceCreditAllowances,
  interval,
  status,
  nowMs,
}: Pick<
  FlatBillingSubscription,
  'planAllowanceMicro' | 'workspaceCreditsForPackMicro' | 'interval' | 'status'
> &
  Partial<Pick<FlatBillingSubscription, 'workspaceCreditAllowances'>> & {
    nowMs: number;
  }): number | null => {
  const workspaceCreditAllowanceMicro = findActiveWorkspaceCreditAllowanceMicro(
    {
      workspaceCreditAllowances: workspaceCreditAllowances ?? [],
      nowMs,
      interval,
      isTrialing: status === SubscriptionStatus.Trialing,
    },
  );

  if (!isDefined(workspaceCreditAllowanceMicro)) {
    return planAllowanceMicro;
  }

  return workspaceCreditsForPackMicro + workspaceCreditAllowanceMicro;
};
