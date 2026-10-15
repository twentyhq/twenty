/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BILLING_PLAN_SWITCHES } from 'src/engine/core-modules/billing/constants/billing-plan-switches.constant';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export const getPlanSwitchOrThrow = ({
  currentPlanKey,
  targetPlanKey,
}: {
  currentPlanKey: BillingPlanKey;
  targetPlanKey?: BillingPlanKey;
}): { targetPlanKey: BillingPlanKey } => {
  const { upgradePlanKeys, downgradePlanKeys } =
    BILLING_PLAN_SWITCHES[currentPlanKey];
  const allowedTargetPlanKeys = [...upgradePlanKeys, ...downgradePlanKeys];

  if (!isDefined(targetPlanKey) && allowedTargetPlanKeys.length !== 1) {
    throw new BillingException(
      `A target plan is required to switch from plan ${currentPlanKey}, which allows ${allowedTargetPlanKeys.length} plan switches`,
      BillingExceptionCode.BILLING_PLAN_NOT_ALLOWED,
    );
  }

  const switchTargetPlanKey = targetPlanKey ?? allowedTargetPlanKeys[0];

  if (!allowedTargetPlanKeys.includes(switchTargetPlanKey)) {
    throw new BillingException(
      `Switching from plan ${currentPlanKey} to plan ${switchTargetPlanKey} is not allowed`,
      BillingExceptionCode.BILLING_PLAN_NOT_ALLOWED,
    );
  }

  return { targetPlanKey: switchTargetPlanKey };
};
