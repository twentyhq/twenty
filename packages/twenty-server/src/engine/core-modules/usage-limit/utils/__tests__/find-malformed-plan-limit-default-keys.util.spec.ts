import { findMalformedPlanLimitDefaultKeys } from 'src/engine/core-modules/usage-limit/utils/find-malformed-plan-limit-default-keys.util';

describe('findMalformedPlanLimitDefaultKeys', () => {
  it('reports nothing for a well formed config', () => {
    expect(
      findMalformedPlanLimitDefaultKeys({
        PRO: {
          values: { WORKSPACE_RECORD_LIMIT: 1_000_000 },
          trialValues: { EMAIL_SEND_WORKSPACE_DAILY_LIMIT: 100 },
        },
        ENTERPRISE: { values: { WORKSPACE_STORAGE_LIMIT_BYTES: null } },
      }),
    ).toEqual([]);
  });

  it('reports a plan entry that is not an object', () => {
    expect(findMalformedPlanLimitDefaultKeys({ PRO: 5 })).toEqual(['PRO']);
  });

  it('reports an unknown section and a section that is not an object', () => {
    expect(
      findMalformedPlanLimitDefaultKeys({
        PRO: { value: {}, trialValues: null },
      }),
    ).toEqual(['PRO.value', 'PRO.trialValues']);
  });

  it('reports values that are not a non-negative integer or null, and variables that are not quota or stock defaults', () => {
    expect(
      findMalformedPlanLimitDefaultKeys({
        PRO: {
          values: {
            WORKSPACE_RECORD_LIMIT: 1.5,
            WORKSPACE_STORAGE_LIMIT_BYTES: -1,
            EMAIL_SEND_WORKSPACE_DAILY_LIMIT: '100',
            API_RATE_LIMITING_SHORT_LIMIT: 10,
            WORKSPACE_RECORD_LIMT: 10,
          },
        },
      }),
    ).toEqual([
      'PRO.values.WORKSPACE_RECORD_LIMIT',
      'PRO.values.WORKSPACE_STORAGE_LIMIT_BYTES',
      'PRO.values.EMAIL_SEND_WORKSPACE_DAILY_LIMIT',
      'PRO.values.API_RATE_LIMITING_SHORT_LIMIT',
      'PRO.values.WORKSPACE_RECORD_LIMT',
    ]);
  });
});
