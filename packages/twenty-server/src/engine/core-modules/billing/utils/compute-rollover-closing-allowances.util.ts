/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PlanWorkspaceCreditsMicro } from 'src/engine/core-modules/billing/utils/compute-plan-workspace-credits-micro.util';

export const computeRolloverClosingAllowances = ({
  planWorkspaceCredits,
  trialAllowanceMicro,
  isFirstPeriodAfterTrial,
  workspaceCreditAllowanceMicro,
}: {
  planWorkspaceCredits: PlanWorkspaceCreditsMicro | null;
  trialAllowanceMicro: number;
  isFirstPeriodAfterTrial: boolean;
  workspaceCreditAllowanceMicro: number | null;
}): {
  closingAllowanceMicro: number;
  closingSeatAllowanceMicro: number;
} | null => {
  if (isDefined(workspaceCreditAllowanceMicro)) {
    return {
      closingAllowanceMicro: isFirstPeriodAfterTrial
        ? 0
        : (planWorkspaceCredits?.workspaceCreditsForPackMicro ?? 0),
      closingSeatAllowanceMicro: workspaceCreditAllowanceMicro,
    };
  }

  if (!isDefined(planWorkspaceCredits)) {
    return null;
  }

  if (isFirstPeriodAfterTrial) {
    return {
      closingAllowanceMicro: trialAllowanceMicro,
      closingSeatAllowanceMicro: 0,
    };
  }

  return {
    closingAllowanceMicro: planWorkspaceCredits.workspaceCreditsForPackMicro,
    closingSeatAllowanceMicro:
      planWorkspaceCredits.workspaceCreditsForSeatsMicro,
  };
};
