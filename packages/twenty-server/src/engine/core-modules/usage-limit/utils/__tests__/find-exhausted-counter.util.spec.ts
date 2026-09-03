import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { findExhaustedCounter } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-counter.util';

const buildCounter = (key: string): AllowanceQuotaCounter => ({
  kind: 'allowance',
  key,
  meter: 'creditsUsedMicro',
  periodStart: new Date('2026-08-01T00:00:00.000Z'),
  periodEnd: new Date('2026-09-01T00:00:00.000Z'),
});

describe('findExhaustedCounter', () => {
  it('answers null when every counter has budget left', () => {
    expect(
      findExhaustedCounter({
        counters: [buildCounter('first'), buildCounter('second')],
        remainings: [250, 1],
      }),
    ).toBeNull();
  });

  it('picks the first counter whose budget is gone', () => {
    expect(
      findExhaustedCounter({
        counters: [buildCounter('first'), buildCounter('second')],
        remainings: [100, 0],
      }),
    ).toMatchObject({ key: 'second' });
  });

  it('counts an overdrawn counter as exhausted', () => {
    expect(
      findExhaustedCounter({
        counters: [buildCounter('first')],
        remainings: [-10],
      }),
    ).toMatchObject({ key: 'first' });
  });

  it('skips cold counters', () => {
    expect(
      findExhaustedCounter({
        counters: [buildCounter('first'), buildCounter('second')],
        remainings: [null, 0],
      }),
    ).toMatchObject({ key: 'second' });
  });

  it('answers null when every counter is cold', () => {
    expect(
      findExhaustedCounter({
        counters: [buildCounter('first')],
        remainings: [null],
      }),
    ).toBeNull();
  });
});
