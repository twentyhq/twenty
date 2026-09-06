import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { findExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-counters.util';

const buildCounter = (key: string): AllowanceQuotaCounter => ({
  kind: 'allowance',
  key,
  meter: 'creditsUsedMicro',
  periodStart: new Date('2026-08-01T00:00:00.000Z'),
  periodEnd: new Date('2026-09-01T00:00:00.000Z'),
});

describe('findExhaustedCounters', () => {
  it('answers empty when every counter has budget left', () => {
    expect(
      findExhaustedCounters({
        counters: [buildCounter('first'), buildCounter('second')],
        remainings: [250, 1],
      }),
    ).toEqual([]);
  });

  it('picks every counter whose budget is gone', () => {
    expect(
      findExhaustedCounters({
        counters: [
          buildCounter('first'),
          buildCounter('second'),
          buildCounter('third'),
        ],
        remainings: [0, 100, 0],
      }),
    ).toMatchObject([{ key: 'first' }, { key: 'third' }]);
  });

  it('counts an overdrawn counter as exhausted', () => {
    expect(
      findExhaustedCounters({
        counters: [buildCounter('first')],
        remainings: [-10],
      }),
    ).toMatchObject([{ key: 'first' }]);
  });

  it('skips cold counters', () => {
    expect(
      findExhaustedCounters({
        counters: [buildCounter('first'), buildCounter('second')],
        remainings: [null, 0],
      }),
    ).toMatchObject([{ key: 'second' }]);
  });

  it('answers empty when every counter is cold', () => {
    expect(
      findExhaustedCounters({
        counters: [buildCounter('first')],
        remainings: [null],
      }),
    ).toEqual([]);
  });
});
