import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { buildStockScopeKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-scope-key.util';
import { buildStockWarmedEntries } from 'src/engine/core-modules/usage-limit/utils/build-stock-warmed-entries.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const TTL = 1_000;

const buildCounter = (overrides: Partial<StockCounter> = {}): StockCounter => ({
  key: 'stock:bytes',
  isDefault: false,
  limitValue: 1_000,
  meter: 'bytes',
  resourceType: UsageResourceType.STORAGE,
  operationType: UsageOperationType.STORAGE_FILE,
  spenderType: 'workspace',
  spenderId: null,
  ...overrides,
});

describe('buildStockWarmedEntries', () => {
  it('warms a counter to what the limit leaves over what is held', () => {
    const counter = buildCounter();

    expect(
      buildStockWarmedEntries({
        coldCounters: [counter],
        usedByScope: new Map([
          [buildStockScopeKey(counter), { bytes: 400, quantity: 2 }],
        ]),
        ttl: TTL,
      }),
    ).toEqual([{ key: 'stock:bytes', value: 600, ttl: TTL }]);
  });

  it('reads each counter against its own meter', () => {
    const counter = buildCounter({
      key: 'stock:quantity',
      meter: 'quantity',
      limitValue: 5,
    });

    expect(
      buildStockWarmedEntries({
        coldCounters: [counter],
        usedByScope: new Map([
          [buildStockScopeKey(counter), { bytes: 400, quantity: 2 }],
        ]),
        ttl: TTL,
      }),
    ).toEqual([{ key: 'stock:quantity', value: 3, ttl: TTL }]);
  });

  it('warms a lowered limit into the red rather than clamping it', () => {
    const counter = buildCounter({ limitValue: 500 });

    expect(
      buildStockWarmedEntries({
        coldCounters: [counter],
        usedByScope: new Map([
          [buildStockScopeKey(counter), { bytes: 900, quantity: 4 }],
        ]),
        ttl: TTL,
      }),
    ).toEqual([{ key: 'stock:bytes', value: -400, ttl: TTL }]);
  });

  it('skips a counter whose scope was never counted', () => {
    expect(
      buildStockWarmedEntries({
        coldCounters: [buildCounter()],
        usedByScope: new Map(),
        ttl: TTL,
      }),
    ).toEqual([]);
  });

  it('warms each spender from its own scope', () => {
    const workspaceCounter = buildCounter();
    const applicationCounter = buildCounter({
      key: 'stock:application:bytes',
      spenderType: 'application',
      spenderId: 'application-1',
      limitValue: 800,
    });

    expect(
      buildStockWarmedEntries({
        coldCounters: [workspaceCounter, applicationCounter],
        usedByScope: new Map([
          [buildStockScopeKey(workspaceCounter), { bytes: 400, quantity: 2 }],
          [buildStockScopeKey(applicationCounter), { bytes: 100, quantity: 1 }],
        ]),
        ttl: TTL,
      }),
    ).toEqual([
      { key: 'stock:bytes', value: 600, ttl: TTL },
      { key: 'stock:application:bytes', value: 700, ttl: TTL },
    ]);
  });
});
