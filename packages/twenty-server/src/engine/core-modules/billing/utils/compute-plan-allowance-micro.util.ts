/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { findActiveWorkspaceCreditAllowanceMicro } from 'src/engine/core-modules/billing/utils/find-active-workspace-credit-allowance-micro.util';

export const computePlanAllowanceMicro = ({
  planAllowanceMicro,
  includedWorkspaceCreditsMicro,
  workspaceCreditAllowances,
  nowMs,
}: Pick<
  FlatBillingSubscription,
  | 'planAllowanceMicro'
  | 'includedWorkspaceCreditsMicro'
  | 'workspaceCreditAllowances'
> & { nowMs: number }): number | null => {
  const workspaceCreditAllowanceMicro = findActiveWorkspaceCreditAllowanceMicro(
    { workspaceCreditAllowances, nowMs },
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
