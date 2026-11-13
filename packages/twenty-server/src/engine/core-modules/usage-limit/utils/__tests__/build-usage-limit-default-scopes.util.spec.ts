import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { buildUsageLimitDefaultScopes } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-default-scopes.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const buildDefaultScopes = (
  defaultLimitValues: Partial<
    Record<OptionalNumericConfigVariableKey, number | null>
  >,
) =>
  buildUsageLimitDefaultScopes({
    getConfigValue: () => 1000,
    getDefaultLimitValue: (limitValueConfigVariable) =>
      limitValueConfigVariable in defaultLimitValues
        ? (defaultLimitValues[limitValueConfigVariable] ?? null)
        : 1000,
  });

const buildStockDefaultScopes = (
  defaultLimitValues: Partial<
    Record<OptionalNumericConfigVariableKey, number | null>
  >,
) =>
  buildDefaultScopes(defaultLimitValues)
    .filter((scope) => scope.limitKind === 'stock')
    .map(({ resourceType, limitValue }) => ({ resourceType, limitValue }));

describe('buildUsageLimitDefaultScopes', () => {
  it('leaves out stock defaults that have no value', () => {
    expect(
      buildStockDefaultScopes({
        WORKSPACE_RECORD_LIMIT: null,
        WORKSPACE_STORAGE_LIMIT_BYTES: null,
      }),
    ).toEqual([]);
  });

  it('keeps stock defaults that have a value', () => {
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

  it('reads speed defaults from their config variable, which no plan sets', () => {
    const speedLimitValues = buildDefaultScopes({
      API_RATE_LIMITING_SHORT_LIMIT: 5,
    })
      .filter((scope) => scope.limitKind === 'speed')
      .map(({ limitValue }) => limitValue);

    expect([...new Set(speedLimitValues)]).toEqual([1000]);
  });

  it('keeps the per-member AI credit default without a value, so an operator can still override it', () => {
    expect(buildDefaultScopes({ AI_USER_CREDITS_LIMIT: null })).toContainEqual(
      expect.objectContaining({
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.ALL,
        spenderType: 'userWorkspace',
        unit: UsageUnit.USER_CREDIT,
        limitValue: null,
        isOverridable: true,
      }),
    );
  });
});
