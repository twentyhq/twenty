import { findAllPlanLimitDefaultValues } from 'src/engine/core-modules/usage-limit/utils/find-all-plan-limit-default-values.util';

describe('findAllPlanLimitDefaultValues', () => {
  it('lists the valid values of every plan and both sections', () => {
    expect(
      findAllPlanLimitDefaultValues({
        PRO: {
          values: { WORKSPACE_RECORD_LIMIT: 1_000_000 },
          trialValues: { WORKSPACE_RECORD_LIMIT: 50_000 },
        },
        ENTERPRISE: {
          values: {
            WORKSPACE_RECORD_LIMIT: null,
            WORKSPACE_STORAGE_LIMIT_BYTES: -1,
          },
        },
        BROKEN: 5,
      }),
    ).toEqual([
      { configVariable: 'WORKSPACE_RECORD_LIMIT', limitValue: 1_000_000 },
      { configVariable: 'WORKSPACE_RECORD_LIMIT', limitValue: 50_000 },
      { configVariable: 'WORKSPACE_RECORD_LIMIT', limitValue: null },
    ]);
  });

  it('lists nothing for the empty default config', () => {
    expect(findAllPlanLimitDefaultValues({})).toEqual([]);
  });
});
