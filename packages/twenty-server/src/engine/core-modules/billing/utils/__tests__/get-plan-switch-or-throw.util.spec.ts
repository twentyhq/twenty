/* @license Enterprise */

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingPlanSwitches } from 'src/engine/core-modules/billing/types/billing-plan-switches.type';
import { getPlanSwitchOrThrow } from 'src/engine/core-modules/billing/utils/get-plan-switch-or-throw.util';

type PlanSwitchCases = {
  planSwitchesName: string;
  planSwitches?: BillingPlanSwitches;
  allowedSwitches: [BillingPlanKey, BillingPlanKey, boolean][];
  refusedSwitches: [BillingPlanKey, BillingPlanKey][];
  switchesWithoutTarget: [BillingPlanKey, BillingPlanKey, boolean][];
  refusedPlanKeysWithoutTarget: BillingPlanKey[];
};

const V2_LAUNCH_PLAN_SWITCHES: BillingPlanSwitches = {
  [BillingPlanKey.PRO]: {
    upgradePlanKeys: [BillingPlanKey.PRO_V2, BillingPlanKey.ORGANIZATION_V2],
    downgradePlanKeys: [],
  },
  [BillingPlanKey.ENTERPRISE]: {
    upgradePlanKeys: [BillingPlanKey.ORGANIZATION_V2],
    downgradePlanKeys: [BillingPlanKey.PRO_V2],
  },
  [BillingPlanKey.PRO_V2]: {
    upgradePlanKeys: [BillingPlanKey.ORGANIZATION_V2],
    downgradePlanKeys: [],
  },
  [BillingPlanKey.ORGANIZATION_V2]: {
    upgradePlanKeys: [],
    downgradePlanKeys: [BillingPlanKey.PRO_V2],
  },
};

const PLAN_SWITCH_CASES: PlanSwitchCases[] = [
  {
    planSwitchesName: 'default plan switches',
    allowedSwitches: [
      [BillingPlanKey.PRO, BillingPlanKey.ENTERPRISE, false],
      [BillingPlanKey.ENTERPRISE, BillingPlanKey.PRO, true],
    ],
    refusedSwitches: [
      [BillingPlanKey.PRO, BillingPlanKey.PRO],
      [BillingPlanKey.PRO, BillingPlanKey.PRO_V2],
      [BillingPlanKey.ENTERPRISE, BillingPlanKey.ORGANIZATION_V2],
      [BillingPlanKey.PRO_V2, BillingPlanKey.ORGANIZATION_V2],
    ],
    switchesWithoutTarget: [
      [BillingPlanKey.PRO, BillingPlanKey.ENTERPRISE, false],
      [BillingPlanKey.ENTERPRISE, BillingPlanKey.PRO, true],
    ],
    refusedPlanKeysWithoutTarget: [
      BillingPlanKey.PRO_V2,
      BillingPlanKey.ORGANIZATION_V2,
    ],
  },
  {
    planSwitchesName: 'V2 launch plan switches',
    planSwitches: V2_LAUNCH_PLAN_SWITCHES,
    allowedSwitches: [
      [BillingPlanKey.PRO, BillingPlanKey.PRO_V2, false],
      [BillingPlanKey.PRO, BillingPlanKey.ORGANIZATION_V2, false],
      [BillingPlanKey.ENTERPRISE, BillingPlanKey.ORGANIZATION_V2, false],
      [BillingPlanKey.ENTERPRISE, BillingPlanKey.PRO_V2, true],
      [BillingPlanKey.PRO_V2, BillingPlanKey.ORGANIZATION_V2, false],
      [BillingPlanKey.ORGANIZATION_V2, BillingPlanKey.PRO_V2, true],
    ],
    refusedSwitches: [
      [BillingPlanKey.PRO, BillingPlanKey.ENTERPRISE],
      [BillingPlanKey.ENTERPRISE, BillingPlanKey.PRO],
      [BillingPlanKey.PRO_V2, BillingPlanKey.PRO],
      [BillingPlanKey.ORGANIZATION_V2, BillingPlanKey.ENTERPRISE],
      [BillingPlanKey.ORGANIZATION_V2, BillingPlanKey.ORGANIZATION_V2],
    ],
    switchesWithoutTarget: [
      [BillingPlanKey.PRO_V2, BillingPlanKey.ORGANIZATION_V2, false],
      [BillingPlanKey.ORGANIZATION_V2, BillingPlanKey.PRO_V2, true],
    ],
    refusedPlanKeysWithoutTarget: [
      BillingPlanKey.PRO,
      BillingPlanKey.ENTERPRISE,
    ],
  },
];

const PLAN_NOT_ALLOWED_ERROR = expect.objectContaining({
  code: BillingExceptionCode.BILLING_PLAN_NOT_ALLOWED,
});

describe.each(PLAN_SWITCH_CASES)(
  'getPlanSwitchOrThrow with the $planSwitchesName',
  ({
    planSwitches,
    allowedSwitches,
    refusedSwitches,
    switchesWithoutTarget,
    refusedPlanKeysWithoutTarget,
  }) => {
    it.each(allowedSwitches)(
      'allows %s to %s with isDowngrade %s',
      (currentPlanKey, targetPlanKey, isDowngrade) => {
        expect(
          getPlanSwitchOrThrow({ currentPlanKey, targetPlanKey, planSwitches }),
        ).toEqual({ targetPlanKey, isDowngrade });
      },
    );

    it.each(refusedSwitches)(
      'refuses %s to %s',
      (currentPlanKey, targetPlanKey) => {
        expect(() =>
          getPlanSwitchOrThrow({ currentPlanKey, targetPlanKey, planSwitches }),
        ).toThrow(PLAN_NOT_ALLOWED_ERROR);
      },
    );

    it.each(switchesWithoutTarget)(
      'switches %s to its only allowed plan %s when no target is given',
      (currentPlanKey, targetPlanKey, isDowngrade) => {
        expect(getPlanSwitchOrThrow({ currentPlanKey, planSwitches })).toEqual({
          targetPlanKey,
          isDowngrade,
        });
      },
    );

    it.each(refusedPlanKeysWithoutTarget)(
      'refuses a switch from %s when no target is given',
      (currentPlanKey) => {
        expect(() =>
          getPlanSwitchOrThrow({ currentPlanKey, planSwitches }),
        ).toThrow(PLAN_NOT_ALLOWED_ERROR);
      },
    );
  },
);
