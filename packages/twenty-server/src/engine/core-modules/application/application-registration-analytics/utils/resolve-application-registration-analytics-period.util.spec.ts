import { resolveApplicationRegistrationAnalyticsPeriod } from 'src/engine/core-modules/application/application-registration-analytics/utils/resolve-application-registration-analytics-period.util';

describe('resolveApplicationRegistrationAnalyticsPeriod', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-12T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should default to the last 30 days ending now', () => {
    expect(resolveApplicationRegistrationAnalyticsPeriod({})).toEqual({
      periodStart: new Date('2026-09-12T12:00:00.000Z'),
      periodEnd: new Date('2026-10-12T12:00:00.000Z'),
    });
  });

  it('should keep an explicit period', () => {
    const periodStart = new Date('2026-01-01T00:00:00.000Z');
    const periodEnd = new Date('2026-02-01T00:00:00.000Z');

    expect(
      resolveApplicationRegistrationAnalyticsPeriod({ periodStart, periodEnd }),
    ).toEqual({ periodStart, periodEnd });
  });

  it('should anchor a missing start on the explicit end', () => {
    const periodEnd = new Date('2026-03-31T00:00:00.000Z');

    expect(
      resolveApplicationRegistrationAnalyticsPeriod({ periodEnd }),
    ).toEqual({
      periodStart: new Date('2026-03-01T00:00:00.000Z'),
      periodEnd,
    });
  });
});
