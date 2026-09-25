import { type FlatStockLimit } from 'src/engine/core-modules/usage-limit/types/flat-stock-limit.type';
import { type StockLimitDefault } from 'src/engine/core-modules/usage-limit/types/stock-limit-default.type';
import { buildStockCounters } from 'src/engine/core-modules/usage-limit/utils/build-stock-counters.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const WORKSPACE_ID = 'workspace-1';

const buildLimit = (
  overrides: Partial<FlatStockLimit> = {},
): FlatStockLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.STORAGE,
  operationType: UsageOperationType.STORAGE_FILE,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'stock',
  periodCount: 1,
  periodUnit: 'lifetime',
  meter: 'bytes',
  limitValue: 500,
  burstValue: null,
  isInstanceOverride: false,
  ...overrides,
});

const buildDefault = (
  overrides: Partial<StockLimitDefault> = {},
): StockLimitDefault => ({
  spenderType: 'workspace',
  meter: 'bytes',
  limitValue: 1_000,
  isOverridable: true,
  ...overrides,
});

const build = ({
  limits = [],
  stockLimitDefaults = [],
  spenders = {},
}: {
  limits?: FlatStockLimit[];
  stockLimitDefaults?: StockLimitDefault[];
  spenders?: { applicationId?: string };
}) =>
  buildStockCounters({
    workspaceId: WORKSPACE_ID,
    resourceType: UsageResourceType.STORAGE,
    operationType: UsageOperationType.STORAGE_FILE,
    spenders,
    limits,
    stockLimitDefaults,
  });

describe('buildStockCounters', () => {
  it('caps the workspace with the default when nothing is stored', () => {
    expect(build({ stockLimitDefaults: [buildDefault()] })).toEqual([
      expect.objectContaining({
        isDefault: true,
        limitValue: 1_000,
        meter: 'bytes',
        spenderType: 'workspace',
        spenderId: null,
      }),
    ]);
  });

  it.each([500, 2_000])(
    'overrides the default with a workspace limit of %i',
    (limitValue) => {
      expect(
        build({
          limits: [buildLimit({ limitValue })],
          stockLimitDefaults: [buildDefault()],
        }),
      ).toEqual([expect.objectContaining({ isDefault: false, limitValue })]);
    },
  );

  it('keeps a non-overridable default alongside a stored limit', () => {
    const counters = build({
      limits: [buildLimit()],
      stockLimitDefaults: [buildDefault({ isOverridable: false })],
    });

    expect(counters.map((counter) => counter.isDefault)).toEqual([false, true]);
    expect(new Set(counters.map((counter) => counter.key)).size).toBe(2);
  });

  it.each([
    { spenderType: 'application' as const, spenderId: 'application-1' },
    { meter: 'quantity' as const },
  ])(
    'preserves the workspace byte default for a different scope: %j',
    (overrides) => {
      const counters = build({
        limits: [buildLimit(overrides)],
        stockLimitDefaults: [buildDefault()],
        spenders: { applicationId: 'application-1' },
      });

      expect(counters.map((counter) => counter.isDefault)).toEqual([
        false,
        true,
      ]);
    },
  );

  it('preserves the default for a different operation', () => {
    expect(
      build({
        limits: [buildLimit({ operationType: UsageOperationType.API_REQUEST })],
        stockLimitDefaults: [buildDefault()],
      }),
    ).toEqual([expect.objectContaining({ isDefault: true })]);
  });

  it('keys a stored limit by its value so an edited limit warms afresh', () => {
    const [before] = build({ limits: [buildLimit({ limitValue: 500 })] });
    const [after] = build({ limits: [buildLimit({ limitValue: 2_000 })] });

    expect(before.key).not.toBe(after.key);
  });

  it('keys the default by its value so a changed setting warms afresh', () => {
    const [before] = build({ stockLimitDefaults: [buildDefault()] });
    const [after] = build({
      stockLimitDefaults: [buildDefault({ limitValue: 2_000 })],
    });

    expect(before.key).not.toBe(after.key);
  });

  it('skips a default whose spender type the call does not carry', () => {
    expect(
      build({
        stockLimitDefaults: [buildDefault({ spenderType: 'application' })],
      }),
    ).toEqual([]);

    expect(
      build({
        stockLimitDefaults: [buildDefault({ spenderType: 'application' })],
        spenders: { applicationId: 'application-1' },
      }),
    ).toHaveLength(1);
  });
});
