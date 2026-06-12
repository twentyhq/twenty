import { fillUsageTimeSeriesGaps } from 'src/engine/core-modules/usage/utils/fill-usage-time-series-gaps.util';

describe('fillUsageTimeSeriesGaps', () => {
  it('should return all-zero series across the period when no rows are returned', () => {
    const result = fillUsageTimeSeriesGaps({
      rows: [],
      periodStart: new Date('2026-04-20T00:00:00.000Z'),
      periodEnd: new Date('2026-04-23T23:59:59.999Z'),
    });

    expect(result).toEqual([
      { date: '2026-04-20', creditsUsed: 0 },
      { date: '2026-04-21', creditsUsed: 0 },
      { date: '2026-04-22', creditsUsed: 0 },
      { date: '2026-04-23', creditsUsed: 0 },
    ]);
  });

  it('should fill internal gaps with zero while preserving real values', () => {
    const result = fillUsageTimeSeriesGaps({
      rows: [
        { date: '2026-04-20', creditsUsed: 100 },
        { date: '2026-04-22', creditsUsed: 250 },
      ],
      periodStart: new Date('2026-04-20T00:00:00.000Z'),
      periodEnd: new Date('2026-04-23T23:59:59.999Z'),
    });

    expect(result).toEqual([
      { date: '2026-04-20', creditsUsed: 100 },
      { date: '2026-04-21', creditsUsed: 0 },
      { date: '2026-04-22', creditsUsed: 250 },
      { date: '2026-04-23', creditsUsed: 0 },
    ]);
  });

  it('should pad trailing dates with zero when data stops before period end (Félix bug)', () => {
    const result = fillUsageTimeSeriesGaps({
      rows: [
        { date: '2026-04-15', creditsUsed: 50 },
        { date: '2026-04-16', creditsUsed: 75 },
      ],
      periodStart: new Date('2026-04-15T00:00:00.000Z'),
      periodEnd: new Date('2026-04-20T23:59:59.999Z'),
    });

    expect(result).toEqual([
      { date: '2026-04-15', creditsUsed: 50 },
      { date: '2026-04-16', creditsUsed: 75 },
      { date: '2026-04-17', creditsUsed: 0 },
      { date: '2026-04-18', creditsUsed: 0 },
      { date: '2026-04-19', creditsUsed: 0 },
      { date: '2026-04-20', creditsUsed: 0 },
    ]);
  });

  it('should pad leading dates with zero when data starts after period start', () => {
    const result = fillUsageTimeSeriesGaps({
      rows: [{ date: '2026-04-22', creditsUsed: 99 }],
      periodStart: new Date('2026-04-20T00:00:00.000Z'),
      periodEnd: new Date('2026-04-23T23:59:59.999Z'),
    });

    expect(result).toEqual([
      { date: '2026-04-20', creditsUsed: 0 },
      { date: '2026-04-21', creditsUsed: 0 },
      { date: '2026-04-22', creditsUsed: 99 },
      { date: '2026-04-23', creditsUsed: 0 },
    ]);
  });

  it('should return data unchanged when every day in period is already present', () => {
    const rows = [
      { date: '2026-04-20', creditsUsed: 1 },
      { date: '2026-04-21', creditsUsed: 2 },
      { date: '2026-04-22', creditsUsed: 3 },
    ];

    const result = fillUsageTimeSeriesGaps({
      rows,
      periodStart: new Date('2026-04-20T00:00:00.000Z'),
      periodEnd: new Date('2026-04-22T23:59:59.999Z'),
    });

    expect(result).toEqual(rows);
  });

  it('should return a single entry when period spans one day', () => {
    const result = fillUsageTimeSeriesGaps({
      rows: [{ date: '2026-04-23', creditsUsed: 42 }],
      periodStart: new Date('2026-04-23T00:00:00.000Z'),
      periodEnd: new Date('2026-04-23T23:59:59.999Z'),
    });

    expect(result).toEqual([{ date: '2026-04-23', creditsUsed: 42 }]);
  });

  it('should return an empty array when periodStart is after periodEnd', () => {
    const result = fillUsageTimeSeriesGaps({
      rows: [],
      periodStart: new Date('2026-04-25T00:00:00.000Z'),
      periodEnd: new Date('2026-04-20T23:59:59.999Z'),
    });

    expect(result).toEqual([]);
  });

  it('should treat periodEnd as exclusive to match SQL `timestamp < periodEnd` semantics', () => {
    const result = fillUsageTimeSeriesGaps({
      rows: [{ date: '2026-04-23', creditsUsed: 10 }],
      periodStart: new Date('2026-04-22T00:00:00.000Z'),
      periodEnd: new Date('2026-04-24T00:00:00.000Z'),
    });

    expect(result).toEqual([
      { date: '2026-04-22', creditsUsed: 0 },
      { date: '2026-04-23', creditsUsed: 10 },
    ]);
  });

  it('should return dates in ascending order', () => {
    const result = fillUsageTimeSeriesGaps({
      rows: [
        { date: '2026-04-22', creditsUsed: 5 },
        { date: '2026-04-20', creditsUsed: 1 },
      ],
      periodStart: new Date('2026-04-20T00:00:00.000Z'),
      periodEnd: new Date('2026-04-23T23:59:59.999Z'),
    });

    expect(result.map((point) => point.date)).toEqual([
      '2026-04-20',
      '2026-04-21',
      '2026-04-22',
      '2026-04-23',
    ]);
  });
});
