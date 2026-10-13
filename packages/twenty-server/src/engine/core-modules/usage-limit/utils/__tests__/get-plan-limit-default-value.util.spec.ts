import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { type PlanUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/types/plan-usage-limit-defaults.type';
import { getPlanLimitDefaultValue } from 'src/engine/core-modules/usage-limit/utils/get-plan-limit-default-value.util';

const INSTANCE_VALUE = 7;

const usageLimitDefaultsByPlan: Record<string, PlanUsageLimitDefaults> = {
  PRO: {
    values: {
      WORKSPACE_RECORD_LIMIT: 1_000,
      WORKSPACE_STORAGE_LIMIT_BYTES: 50,
    },
    trialValues: {
      WORKSPACE_RECORD_LIMIT: 100,
      EMAIL_SEND_WORKSPACE_DAILY_LIMIT: null,
    },
  },
  ENTERPRISE: { values: { WORKSPACE_RECORD_LIMIT: null } },
};

describe('getPlanLimitDefaultValue', () => {
  it.each<[string, boolean, OptionalNumericConfigVariableKey, number | null]>([
    ['PRO', false, 'WORKSPACE_RECORD_LIMIT', 1_000],
    ['PRO', true, 'WORKSPACE_RECORD_LIMIT', 100],
    ['PRO', true, 'WORKSPACE_STORAGE_LIMIT_BYTES', 50],
    ['PRO', true, 'EMAIL_SEND_WORKSPACE_DAILY_LIMIT', null],
    ['PRO', false, 'EMAIL_SEND_WORKSPACE_DAILY_LIMIT', INSTANCE_VALUE],
    ['ENTERPRISE', false, 'WORKSPACE_RECORD_LIMIT', null],
    ['ENTERPRISE', true, 'WORKSPACE_RECORD_LIMIT', null],
    ['ENTERPRISE', false, 'WORKSPACE_STORAGE_LIMIT_BYTES', INSTANCE_VALUE],
    ['UNKNOWN', true, 'WORKSPACE_RECORD_LIMIT', INSTANCE_VALUE],
  ])(
    'on %s with trialing %s, %s is %p',
    (planKey, isTrialing, limitValueConfigVariable, expected) => {
      expect(
        getPlanLimitDefaultValue({
          usageLimitDefaultsByPlan,
          subscriptionPlan: { planKey, isTrialing },
          limitValueConfigVariable,
          instanceValue: INSTANCE_VALUE,
        }),
      ).toBe(expected);
    },
  );
});
