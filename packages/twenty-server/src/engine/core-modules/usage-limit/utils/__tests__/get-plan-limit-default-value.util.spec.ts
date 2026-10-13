import { getPlanLimitDefaultValue } from 'src/engine/core-modules/usage-limit/utils/get-plan-limit-default-value.util';

const usageLimitDefaultsByPlan = {
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
  it.each([
    ['PRO', false, 'WORKSPACE_RECORD_LIMIT', 1_000],
    ['PRO', true, 'WORKSPACE_RECORD_LIMIT', 100],
    ['PRO', true, 'WORKSPACE_STORAGE_LIMIT_BYTES', 50],
    ['PRO', true, 'EMAIL_SEND_WORKSPACE_DAILY_LIMIT', null],
    ['PRO', false, 'EMAIL_SEND_WORKSPACE_DAILY_LIMIT', undefined],
    ['ENTERPRISE', false, 'WORKSPACE_RECORD_LIMIT', null],
    ['ENTERPRISE', true, 'WORKSPACE_RECORD_LIMIT', null],
    ['ENTERPRISE', false, 'WORKSPACE_STORAGE_LIMIT_BYTES', undefined],
    ['UNKNOWN', true, 'WORKSPACE_RECORD_LIMIT', undefined],
  ])(
    'on %s with trialing %s, %s is %p',
    (planKey, isTrialing, limitValueConfigVariable, expected) => {
      expect(
        getPlanLimitDefaultValue({
          usageLimitDefaultsByPlan,
          subscriptionPlan: { planKey, isTrialing },
          limitValueConfigVariable,
        }),
      ).toBe(expected);
    },
  );
});
