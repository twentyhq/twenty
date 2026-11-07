import { computeDaysUntilReset } from '@/ai/utils/computeDaysUntilReset';

describe('computeDaysUntilReset', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-23T12:00:00Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each<[string, number]>([
    ['2026-10-26T12:00:00Z', 3],
    ['2026-10-26T00:00:00Z', 3],
    ['2026-10-23T12:05:00Z', 1],
    ['2026-10-23T12:00:00Z', 0],
    ['2026-10-20T00:00:00Z', 0],
  ])(
    'counts the days left until %s, a partial day as a full one',
    (periodEnd, expected) => {
      expect(computeDaysUntilReset(periodEnd)).toBe(expected);
    },
  );
});
