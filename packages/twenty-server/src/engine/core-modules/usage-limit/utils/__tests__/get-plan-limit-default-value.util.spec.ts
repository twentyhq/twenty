import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { type PlanUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/types/plan-usage-limit-defaults.type';
import { getPlanLimitDefaultValue } from 'src/engine/core-modules/usage-limit/utils/get-plan-limit-default-value.util';

const INSTANCE_VALUE = 7;

const usageLimitDefaultsByPlan: Record<string, PlanUsageLimitDefaults> = {
  PRO: {
    WORKSPACE_RECORD_LIMIT: 1_000,
    EMAIL_SEND_WORKSPACE_DAILY_LIMIT: null,
    AI_USER_CREDITS_LIMIT: 5_000,
  },
  TRIAL: {
    AI_USER_CREDITS_LIMIT: null,
    WORKSPACE_STORAGE_LIMIT_BYTES: 100,
  },
};

describe('getPlanLimitDefaultValue', () => {
  it.each<
    [string | null, boolean, OptionalNumericConfigVariableKey, number | null]
  >([
    ['PRO', false, 'WORKSPACE_RECORD_LIMIT', 1_000],
    ['PRO', false, 'EMAIL_SEND_WORKSPACE_DAILY_LIMIT', null],
    ['PRO', false, 'WORKSPACE_STORAGE_LIMIT_BYTES', INSTANCE_VALUE],
    ['PRO', false, 'AI_USER_CREDITS_LIMIT', 5_000],
    ['UNKNOWN', false, 'WORKSPACE_RECORD_LIMIT', INSTANCE_VALUE],
    [null, false, 'WORKSPACE_RECORD_LIMIT', INSTANCE_VALUE],
    ['PRO', true, 'AI_USER_CREDITS_LIMIT', null],
    ['PRO', true, 'WORKSPACE_STORAGE_LIMIT_BYTES', 100],
    ['PRO', true, 'WORKSPACE_RECORD_LIMIT', 1_000],
    ['UNKNOWN', true, 'EMAIL_SEND_WORKSPACE_DAILY_LIMIT', INSTANCE_VALUE],
    [null, true, 'AI_USER_CREDITS_LIMIT', null],
  ])(
    'on %s with isTrialing %s, %s is %p',
    (planKey, isTrialing, limitValueConfigVariable, expected) => {
      expect(
        getPlanLimitDefaultValue({
          usageLimitDefaultsByPlan,
          planKey,
          isTrialing,
          limitValueConfigVariable,
          instanceValue: INSTANCE_VALUE,
        }),
      ).toBe(expected);
    },
  );
});
