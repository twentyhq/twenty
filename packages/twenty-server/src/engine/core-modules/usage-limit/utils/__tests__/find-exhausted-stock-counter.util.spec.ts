import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { findExhaustedStockCounter } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-stock-counter.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

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

describe('findExhaustedStockCounter', () => {
  it('admits a cost that exactly consumes the remainder', () => {
    expect(
      findExhaustedStockCounter({
        counters: [buildCounter()],
        remainings: [250],
        cost: { [UsageUnit.BYTE]: 250 },
      }),
    ).toBeNull();
  });

  it('reports the counter a cost overruns, with what was left', () => {
    const counter = buildCounter();

    expect(
      findExhaustedStockCounter({
        counters: [counter],
        remainings: [250],
        cost: { [UsageUnit.BYTE]: 251 },
      }),
    ).toEqual({ counter, remaining: 250 });
  });

  it('admits a counter the cost does not touch', () => {
    expect(
      findExhaustedStockCounter({
        counters: [buildCounter({ unit: UsageUnit.FILE })],
        remainings: [0],
        cost: { [UsageUnit.BYTE]: 400 },
      }),
    ).toBeNull();
  });

  it('admits a counter that could not be read', () => {
    expect(
      findExhaustedStockCounter({
        counters: [buildCounter()],
        remainings: [null],
        cost: { [UsageUnit.BYTE]: 400 },
      }),
    ).toBeNull();
  });

  it('refuses on a counter already in the red', () => {
    expect(
      findExhaustedStockCounter({
        counters: [buildCounter()],
        remainings: [-10],
        cost: { [UsageUnit.BYTE]: 1 },
      }),
    ).toMatchObject({ remaining: -10 });
  });

  it('keeps looking past a counter the cost fits in', () => {
    const fileCounter = buildCounter({
      key: 'stock:FILE',
      unit: UsageUnit.FILE,
      limitValue: 5,
    });

    expect(
      findExhaustedStockCounter({
        counters: [buildCounter(), fileCounter],
        remainings: [500, 0],
        cost: { [UsageUnit.BYTE]: 400, [UsageUnit.FILE]: 1 },
      }),
    ).toEqual({ counter: fileCounter, remaining: 0 });
  });
});
