import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { resolveApplicationRegistrationAnalyticsPeriod } from 'src/engine/core-modules/application/application-registration-analytics/utils/resolve-application-registration-analytics-period.util';

describe('resolveApplicationRegistrationAnalyticsPeriod', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-12T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should default to the last 30 days ending now, widened to whole UTC days', () => {
    expect(resolveApplicationRegistrationAnalyticsPeriod({})).toEqual({
      periodStart: new Date('2026-09-12T00:00:00.000Z'),
      periodEnd: new Date('2026-10-13T00:00:00.000Z'),
    });
  });

  it('should snap an explicit unaligned period to whole UTC days', () => {
    expect(
      resolveApplicationRegistrationAnalyticsPeriod({
        periodStart: new Date('2026-10-01T13:45:12.345Z'),
        periodEnd: new Date('2026-10-05T08:00:00.000Z'),
      }),
    ).toEqual({
      periodStart: new Date('2026-10-01T00:00:00.000Z'),
      periodEnd: new Date('2026-10-06T00:00:00.000Z'),
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

  it('should reject a period whose start is after its end', () => {
    expect(() =>
      resolveApplicationRegistrationAnalyticsPeriod({
        periodStart: new Date('2026-02-01T00:00:00.000Z'),
        periodEnd: new Date('2026-01-01T00:00:00.000Z'),
      }),
    ).toThrow(
      new ApplicationRegistrationException(
        'Analytics period start must be before its end',
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      ),
    );
  });

  it('should reject a period longer than a year', () => {
    expect(() =>
      resolveApplicationRegistrationAnalyticsPeriod({
        periodStart: new Date('0001-01-01T00:00:00.000Z'),
        periodEnd: new Date('9999-12-31T00:00:00.000Z'),
      }),
    ).toThrow(ApplicationRegistrationException);
  });

  it('should accept a period of exactly a year', () => {
    const periodStart = new Date('2025-10-12T00:00:00.000Z');
    const periodEnd = new Date('2026-10-12T00:00:00.000Z');

    expect(
      resolveApplicationRegistrationAnalyticsPeriod({ periodStart, periodEnd }),
    ).toEqual({ periodStart, periodEnd });
  });
});
