import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { getLimitDefaultValue } from 'src/engine/core-modules/usage-limit/utils/get-limit-default-value.util';

const getConfigValue = (key: NumericConfigVariableKey) =>
  key === 'WORKSPACE_RECORD_LIMIT' ? 10_000_000 : 1;

describe('getLimitDefaultValue', () => {
  it('uses the plan value when the plan sets one', () => {
    expect(
      getLimitDefaultValue({
        limitValueConfigVariable: 'WORKSPACE_RECORD_LIMIT',
        planValues: new Map([['WORKSPACE_RECORD_LIMIT', 1_000]]),
        getConfigValue,
      }),
    ).toBe(1_000);
  });

  it('returns null when the plan removes the default', () => {
    expect(
      getLimitDefaultValue({
        limitValueConfigVariable: 'WORKSPACE_RECORD_LIMIT',
        planValues: new Map([['WORKSPACE_RECORD_LIMIT', null]]),
        getConfigValue,
      }),
    ).toBeNull();
  });

  it('keeps the config variable value when the plan leaves it out', () => {
    expect(
      getLimitDefaultValue({
        limitValueConfigVariable: 'WORKSPACE_RECORD_LIMIT',
        planValues: new Map([['WORKSPACE_STORAGE_LIMIT_BYTES', 1_000]]),
        getConfigValue,
      }),
    ).toBe(10_000_000);
  });
});
