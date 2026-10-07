import { findCandidateLimitDefaultValues } from 'src/engine/core-modules/usage-limit/utils/find-candidate-limit-default-values.util';

describe('findCandidateLimitDefaultValues', () => {
  it('returns the instance value alone when no plan sets the variable', () => {
    expect(
      findCandidateLimitDefaultValues({
        limitValueConfigVariable: 'WORKSPACE_RECORD_LIMIT',
        plans: {},
        instanceValue: 10_000_000,
      }),
    ).toEqual([10_000_000]);
  });

  it('adds every plan and trial value of the variable once, leaving out removed defaults and other variables', () => {
    expect(
      findCandidateLimitDefaultValues({
        limitValueConfigVariable: 'WORKSPACE_RECORD_LIMIT',
        plans: {
          PRO: {
            values: {
              WORKSPACE_RECORD_LIMIT: 1_000_000,
              WORKSPACE_STORAGE_LIMIT_BYTES: 500,
            },
            trialValues: { WORKSPACE_RECORD_LIMIT: 10_000_000 },
          },
          ENTERPRISE: { values: { WORKSPACE_RECORD_LIMIT: null } },
          STARTER: { trialValues: { WORKSPACE_RECORD_LIMIT: 50_000 } },
        },
        instanceValue: 10_000_000,
      }),
    ).toEqual([10_000_000, 1_000_000, 50_000]);
  });
});
