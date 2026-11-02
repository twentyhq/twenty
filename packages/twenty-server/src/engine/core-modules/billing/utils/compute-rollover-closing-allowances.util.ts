/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PlanWorkspaceCreditsMicro } from 'src/engine/core-modules/billing/utils/compute-plan-workspace-credits-micro.util';

// The seat allowance is spent first and never rolls over, so an override takes its place
export const computeRolloverClosingAllowances = ({
  planWorkspaceCredits,
  trialAllowanceMicro,
  isFirstPeriodAfterTrial,
  workspaceCreditAllowanceMicro,
}: {
  planWorkspaceCredits: PlanWorkspaceCreditsMicro;
  trialAllowanceMicro: number;
  isFirstPeriodAfterTrial: boolean;
  workspaceCreditAllowanceMicro: number | null;
}): {
  closingAllowanceMicro: number;
  closingSeatAllowanceMicro: number;
} => {
  if (isDefined(workspaceCreditAllowanceMicro)) {
    return {
      closingAllowanceMicro: isFirstPeriodAfterTrial
        ? 0
        : planWorkspaceCredits.workspaceCreditsForPackMicro,
      closingSeatAllowanceMicro: workspaceCreditAllowanceMicro,
    };
  }

  // Trial credits carry into the first paid period; the trial allowance comes from config, not the price
  return isFirstPeriodAfterTrial
    ? {
        closingAllowanceMicro: trialAllowanceMicro,
        closingSeatAllowanceMicro: 0,
      }
    : {
        closingAllowanceMicro:
          planWorkspaceCredits.workspaceCreditsForPackMicro,
        closingSeatAllowanceMicro:
          planWorkspaceCredits.workspaceCreditsForSeatsMicro,
      };
};
