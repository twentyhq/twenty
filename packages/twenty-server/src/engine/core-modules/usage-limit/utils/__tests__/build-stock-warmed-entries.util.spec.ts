import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { buildStockScopeKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-scope-key.util';
import { buildStockWarmedEntries } from 'src/engine/core-modules/usage-limit/utils/build-stock-warmed-entries.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const TTL = 1_000;

const buildCounter = (overrides: Partial<StockCounter> = {}): StockCounter => ({
  key: 'stock:BYTE',
  isDefault: false,
  limitValue: 1_000,
  unit: UsageUnit.BYTE,
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
          [
            buildStockScopeKey(counter),
            { [UsageUnit.BYTE]: 400, [UsageUnit.FILE]: 2 },
          ],
        ]),
        ttl: TTL,
      }),
    ).toEqual([{ key: 'stock:BYTE', value: 600, ttl: TTL }]);
  });

  it('reads each counter against its own unit', () => {
    const counter = buildCounter({
      key: 'stock:FILE',
      unit: UsageUnit.FILE,
      limitValue: 5,
    });

    expect(
      buildStockWarmedEntries({
        coldCounters: [counter],
        usedByScope: new Map([
          [
            buildStockScopeKey(counter),
            { [UsageUnit.BYTE]: 400, [UsageUnit.FILE]: 2 },
          ],
        ]),
        ttl: TTL,
      }),
    ).toEqual([{ key: 'stock:FILE', value: 3, ttl: TTL }]);
  });

  it('warms counters of different units on the same scope from one read', () => {
    const byteCounter = buildCounter();
    const fileCounter = buildCounter({
      key: 'stock:FILE',
      unit: UsageUnit.FILE,
      limitValue: 5,
    });

    expect(
      buildStockWarmedEntries({
        coldCounters: [byteCounter, fileCounter],
        usedByScope: new Map([
          [
            buildStockScopeKey(byteCounter),
            { [UsageUnit.BYTE]: 400, [UsageUnit.FILE]: 2 },
          ],
        ]),
        ttl: TTL,
      }),
    ).toEqual([
      { key: 'stock:BYTE', value: 600, ttl: TTL },
      { key: 'stock:FILE', value: 3, ttl: TTL },
    ]);
  });

  it('leaves a counter cold when its unit was not counted', () => {
    const counter = buildCounter({
      key: 'stock:FILE',
      unit: UsageUnit.FILE,
      limitValue: 5,
    });

    expect(
      buildStockWarmedEntries({
        coldCounters: [counter],
        usedByScope: new Map([
          [buildStockScopeKey(counter), { [UsageUnit.BYTE]: 400 }],
        ]),
        ttl: TTL,
      }),
    ).toEqual([]);
  });

  it('warms a lowered limit into the red rather than clamping it', () => {
    const counter = buildCounter({ limitValue: 500 });

    expect(
      buildStockWarmedEntries({
        coldCounters: [counter],
        usedByScope: new Map([
          [
            buildStockScopeKey(counter),
            { [UsageUnit.BYTE]: 900, [UsageUnit.FILE]: 4 },
          ],
        ]),
        ttl: TTL,
      }),
    ).toEqual([{ key: 'stock:BYTE', value: -400, ttl: TTL }]);
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
      key: 'stock:application:BYTE',
      spenderType: 'application',
      spenderId: 'application-1',
      limitValue: 800,
    });

    expect(
      buildStockWarmedEntries({
        coldCounters: [workspaceCounter, applicationCounter],
        usedByScope: new Map([
          [
            buildStockScopeKey(workspaceCounter),
            { [UsageUnit.BYTE]: 400, [UsageUnit.FILE]: 2 },
          ],
          [
            buildStockScopeKey(applicationCounter),
            { [UsageUnit.BYTE]: 100, [UsageUnit.FILE]: 1 },
          ],
        ]),
        ttl: TTL,
      }),
    ).toEqual([
      { key: 'stock:BYTE', value: 600, ttl: TTL },
      { key: 'stock:application:BYTE', value: 700, ttl: TTL },
    ]);
  });
});
