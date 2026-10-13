import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { type PlanUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/types/plan-usage-limit-defaults.type';
import { getPlanLimitDefaultValue } from 'src/engine/core-modules/usage-limit/utils/get-plan-limit-default-value.util';

const INSTANCE_VALUE = 7;

const usageLimitDefaultsByPlan: Record<string, PlanUsageLimitDefaults> = {
  PRO: {
    WORKSPACE_RECORD_LIMIT: 1_000,
    EMAIL_SEND_WORKSPACE_DAILY_LIMIT: null,
  },
};

describe('getPlanLimitDefaultValue', () => {
  it.each<[string, OptionalNumericConfigVariableKey, number | null]>([
    ['PRO', 'WORKSPACE_RECORD_LIMIT', 1_000],
    ['PRO', 'EMAIL_SEND_WORKSPACE_DAILY_LIMIT', null],
    ['PRO', 'WORKSPACE_STORAGE_LIMIT_BYTES', INSTANCE_VALUE],
    ['UNKNOWN', 'WORKSPACE_RECORD_LIMIT', INSTANCE_VALUE],
  ])('on %s, %s is %p', (planKey, limitValueConfigVariable, expected) => {
    expect(
      getPlanLimitDefaultValue({
        usageLimitDefaultsByPlan,
        planKey,
        limitValueConfigVariable,
        instanceValue: INSTANCE_VALUE,
      }),
    ).toBe(expected);
  });
});
