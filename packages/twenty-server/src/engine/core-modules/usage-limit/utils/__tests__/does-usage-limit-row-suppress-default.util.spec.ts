import { type StockLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/stock-limit-default-definition.type';
import {
  buildUsageLimitScope,
  type UsageLimitScope,
} from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const buildDefault = (
  overrides: Partial<StockLimitDefaultDefinition> = {},
): StockLimitDefaultDefinition => ({
  resourceType: UsageResourceType.STORAGE,
  operationType: UsageOperationType.STORAGE_FILE,
  limitKind: 'stock',
  spenderType: 'workspace',
  spenderId: '',
  meter: 'bytes',
  periodUnit: 'lifetime',
  periodCount: 1,
  limitValueConfigVariable: 'WORKSPACE_STORAGE_LIMIT_BYTES',
  isOverridable: true,
  ...overrides,
});

const buildScope = (
  overrides: Partial<UsageLimitScope> = {},
): UsageLimitScope =>
  buildUsageLimitScope({
    resourceType: UsageResourceType.STORAGE,
    operationType: UsageOperationType.STORAGE_FILE,
    spenderType: 'workspace',
    spenderId: '',
    limitKind: 'stock',
    periodCount: 1,
    periodUnit: 'lifetime',
    meter: 'bytes',
    ...overrides,
  });

describe('doesUsageLimitRowSuppressDefault', () => {
  it('suppresses the default a workspace-wide row stands in for', () => {
    expect(
      doesUsageLimitRowSuppressDefault({
        scope: buildScope(),
        usageLimitDefault: buildDefault(),
      }),
    ).toBe(true);
  });

  it('never suppresses a default that is not overridable', () => {
    expect(
      doesUsageLimitRowSuppressDefault({
        scope: buildScope(),
        usageLimitDefault: buildDefault({ isOverridable: false }),
      }),
    ).toBe(false);
  });

  it('never suppresses from a row scoped to one spender', () => {
    expect(
      doesUsageLimitRowSuppressDefault({
        scope: buildScope({
          spenderId: 'ef0cfbbd-8b6e-4f9d-9a7c-1a2b3c4d5e6f',
        }),
        usageLimitDefault: buildDefault(),
      }),
    ).toBe(false);
  });

  it.each([
    ['meter', { meter: 'quantity' } as Partial<UsageLimitScope>],
    [
      'spender type',
      { spenderType: 'application' } as Partial<UsageLimitScope>,
    ],
    [
      'resource type',
      { resourceType: UsageResourceType.RECORD } as Partial<UsageLimitScope>,
    ],
    ['limit kind', { limitKind: 'quota' } as Partial<UsageLimitScope>],
  ])('does not suppress across a different %s', (_label, overrides) => {
    expect(
      doesUsageLimitRowSuppressDefault({
        scope: buildScope(overrides),
        usageLimitDefault: buildDefault(),
      }),
    ).toBe(false);
  });

  it('does not suppress from an ALL row, which the kind rules keep out of speed and stock', () => {
    expect(
      doesUsageLimitRowSuppressDefault({
        scope: buildScope({ operationType: UsageOperationType.ALL }),
        usageLimitDefault: buildDefault(),
      }),
    ).toBe(false);
  });

  it('ignores the period, which no builder matches on', () => {
    expect(
      doesUsageLimitRowSuppressDefault({
        scope: buildScope({ periodCount: 60, periodUnit: 'second' }),
        usageLimitDefault: buildDefault(),
      }),
    ).toBe(true);
  });
});
