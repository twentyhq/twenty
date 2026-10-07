import { findPlanLimitDefaultValues } from 'src/engine/core-modules/usage-limit/utils/find-plan-limit-default-values.util';

const plans = {
  PRO: {
    values: {
      WORKSPACE_RECORD_LIMIT: 1_000_000,
      WORKSPACE_STORAGE_LIMIT_BYTES: 10_000,
    },
    trialValues: { WORKSPACE_RECORD_LIMIT: 50_000 },
  },
  ENTERPRISE: {
    values: { WORKSPACE_RECORD_LIMIT: null },
  },
};

describe('findPlanLimitDefaultValues', () => {
  it('returns the plan values of a paying workspace', () => {
    expect(
      findPlanLimitDefaultValues({
        plans,
        subscriptionPlan: { planKey: 'PRO', isTrialing: false },
      }),
    ).toEqual(
      new Map([
        ['WORKSPACE_RECORD_LIMIT', 1_000_000],
        ['WORKSPACE_STORAGE_LIMIT_BYTES', 10_000],
      ]),
    );
  });

  it('lets trial values win over plan values while trialing, keeping the others', () => {
    expect(
      findPlanLimitDefaultValues({
        plans,
        subscriptionPlan: { planKey: 'PRO', isTrialing: true },
      }),
    ).toEqual(
      new Map([
        ['WORKSPACE_RECORD_LIMIT', 50_000],
        ['WORKSPACE_STORAGE_LIMIT_BYTES', 10_000],
      ]),
    );
  });

  it('lets a trial remove a default the paid plan caps', () => {
    expect(
      findPlanLimitDefaultValues({
        plans: {
          PRO: {
            values: { WORKSPACE_RECORD_LIMIT: 1_000 },
            trialValues: { WORKSPACE_RECORD_LIMIT: null },
          },
        },
        subscriptionPlan: { planKey: 'PRO', isTrialing: true },
      }),
    ).toEqual(new Map([['WORKSPACE_RECORD_LIMIT', null]]));
  });

  it('falls back to the plan values for a trial when the plan has no trial values', () => {
    expect(
      findPlanLimitDefaultValues({
        plans,
        subscriptionPlan: { planKey: 'ENTERPRISE', isTrialing: true },
      }),
    ).toEqual(new Map([['WORKSPACE_RECORD_LIMIT', null]]));
  });

  it('returns nothing for a plan the config does not mention', () => {
    expect(
      findPlanLimitDefaultValues({
        plans,
        subscriptionPlan: { planKey: 'STARTER', isTrialing: false },
      }).size,
    ).toBe(0);
  });

  it('keeps only valid values of quota and stock defaults', () => {
    expect(
      findPlanLimitDefaultValues({
        plans: {
          PRO: {
            values: {
              WORKSPACE_RECORD_LIMIT: -1,
              WORKSPACE_STORAGE_LIMIT_BYTES: 1.5,
              EMAIL_SEND_WORKSPACE_DAILY_LIMIT: '100',
              API_RATE_LIMITING_SHORT_LIMIT: 10,
              NOT_A_CONFIG_VARIABLE: 10,
            },
          },
        },
        subscriptionPlan: { planKey: 'PRO', isTrialing: false },
      }).size,
    ).toBe(0);
  });

  it.each([5, null, [1000], 'PRO'])(
    'never throws on a plan entry of %p',
    (planEntry) => {
      expect(
        findPlanLimitDefaultValues({
          plans: { PRO: planEntry },
          subscriptionPlan: { planKey: 'PRO', isTrialing: true },
        }).size,
      ).toBe(0);
    },
  );

  it('keeps a well formed section next to a malformed one', () => {
    expect(
      findPlanLimitDefaultValues({
        plans: {
          PRO: {
            values: { WORKSPACE_RECORD_LIMIT: 1_000 },
            trialValues: [1000],
          },
        },
        subscriptionPlan: { planKey: 'PRO', isTrialing: true },
      }),
    ).toEqual(new Map([['WORKSPACE_RECORD_LIMIT', 1_000]]));
  });
});
