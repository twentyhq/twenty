import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { findExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-counters.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');
const PERIOD_END = new Date('2026-09-01T00:00:00.000Z');

const buildAllowanceCounter = (key: string): AllowanceQuotaCounter => ({
  kind: 'allowance',
  key,
  meter: 'creditsUsedMicro',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
});

const buildLimitCounter = (key: string): LimitQuotaCounter => ({
  kind: 'limit',
  isDefault: false,
  key,
  limitValue: 1_000,
  meter: 'creditsUsedMicro',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  periodUnit: 'month',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  spenderType: 'workspace',
  spenderId: null,
});

describe('findExhaustedCounters', () => {
  it('answers empty when every counter has budget left', () => {
    expect(
      findExhaustedCounters({
        counters: [
          buildAllowanceCounter('first'),
          buildAllowanceCounter('second'),
        ],
        remainings: [250, 1],
      }),
    ).toEqual([]);
  });

  it('picks every counter whose budget is gone', () => {
    expect(
      findExhaustedCounters({
        counters: [
          buildAllowanceCounter('first'),
          buildAllowanceCounter('second'),
          buildAllowanceCounter('third'),
        ],
        remainings: [0, 100, 0],
      }),
    ).toMatchObject([{ key: 'first' }, { key: 'third' }]);
  });

  it('counts an overdrawn counter as exhausted', () => {
    expect(
      findExhaustedCounters({
        counters: [buildAllowanceCounter('first')],
        remainings: [-10],
      }),
    ).toMatchObject([{ key: 'first' }]);
  });

  it('skips cold counters', () => {
    expect(
      findExhaustedCounters({
        counters: [
          buildAllowanceCounter('first'),
          buildAllowanceCounter('second'),
        ],
        remainings: [null, 0],
      }),
    ).toMatchObject([{ key: 'second' }]);
  });

  it('answers empty when every counter is cold', () => {
    expect(
      findExhaustedCounters({
        counters: [buildAllowanceCounter('first')],
        remainings: [null],
      }),
    ).toEqual([]);
  });

  it('refuses a limit that cannot cover the named cost', () => {
    expect(
      findExhaustedCounters({
        counters: [buildLimitCounter('first')],
        remainings: [100],
        cost: { creditsUsedMicro: 101, quantity: 0 },
      }),
    ).toMatchObject([{ key: 'first' }]);
  });

  it('admits a cost that fits the remaining exactly', () => {
    expect(
      findExhaustedCounters({
        counters: [buildLimitCounter('first')],
        remainings: [100],
        cost: { creditsUsedMicro: 100, quantity: 0 },
      }),
    ).toEqual([]);
  });

  it('charges a limit only for the meter it counts', () => {
    expect(
      findExhaustedCounters({
        counters: [buildLimitCounter('first')],
        remainings: [10],
        cost: { creditsUsedMicro: 0, quantity: 500 },
      }),
    ).toEqual([]);
  });

  it('still refuses an emptied limit whatever the cost', () => {
    expect(
      findExhaustedCounters({
        counters: [buildLimitCounter('first')],
        remainings: [0],
        cost: { creditsUsedMicro: 0, quantity: 0 },
      }),
    ).toMatchObject([{ key: 'first' }]);
  });

  it('leaves the credit allowance to drain rather than charging it the whole cost', () => {
    expect(
      findExhaustedCounters({
        counters: [buildAllowanceCounter('allowance')],
        remainings: [10],
        cost: { creditsUsedMicro: 5_000, quantity: 100 },
      }),
    ).toEqual([]);
  });

  it('still refuses an emptied credit allowance under a named cost', () => {
    expect(
      findExhaustedCounters({
        counters: [buildAllowanceCounter('allowance')],
        remainings: [0],
        cost: { creditsUsedMicro: 5_000, quantity: 100 },
      }),
    ).toMatchObject([{ key: 'allowance' }]);
  });
});
