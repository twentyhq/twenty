/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceCreditAllowanceWindow } from 'src/engine/core-modules/billing/types/workspace-credit-allowance-window.type';

export const findActiveWorkspaceCreditAllowanceMicro = ({
  workspaceCreditAllowances,
  nowMs,
}: {
  workspaceCreditAllowances: WorkspaceCreditAllowanceWindow[];
  nowMs: number;
}): number | null =>
  workspaceCreditAllowances.find(
    ({ startsAtMs, endsAtMs }) =>
      startsAtMs <= nowMs && (!isDefined(endsAtMs) || endsAtMs > nowMs),
  )?.amountMicro ?? null;
