import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { buildUsageLimitDefaultScopes } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-default-scopes.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const buildStockDefaultScopes = (
  stockConfigValues: Pick<
    ConfigVariables,
    'WORKSPACE_RECORD_LIMIT' | 'WORKSPACE_STORAGE_LIMIT_BYTES'
  >,
) =>
  buildUsageLimitDefaultScopes({
    getConfigValue: <TKey extends OptionalNumericConfigVariableKey>(
      key: TKey,
    ) =>
      (key in stockConfigValues
        ? stockConfigValues[key as keyof typeof stockConfigValues]
        : 1000) as ConfigVariables[TKey],
  })
    .filter((scope) => scope.limitKind === 'stock')
    .map(({ resourceType, limitValue }) => ({ resourceType, limitValue }));

describe('buildUsageLimitDefaultScopes', () => {
  it('leaves out stock defaults whose config variable is unset', () => {
    expect(
      buildStockDefaultScopes({
        WORKSPACE_RECORD_LIMIT: undefined,
        WORKSPACE_STORAGE_LIMIT_BYTES: undefined,
      }),
    ).toEqual([]);
  });

  it('keeps stock defaults whose config variable is set', () => {
    expect(
      buildStockDefaultScopes({
        WORKSPACE_RECORD_LIMIT: 5,
        WORKSPACE_STORAGE_LIMIT_BYTES: 10,
      }),
    ).toEqual(
      expect.arrayContaining([
        { resourceType: UsageResourceType.RECORD, limitValue: 5 },
        { resourceType: UsageResourceType.STORAGE, limitValue: 10 },
      ]),
    );
  });
});
