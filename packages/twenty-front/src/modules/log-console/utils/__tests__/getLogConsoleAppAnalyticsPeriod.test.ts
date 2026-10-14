import { getLogConsoleAppAnalyticsPeriod } from '@/log-console/utils/getLogConsoleAppAnalyticsPeriod';

const NOW = '2026-10-14T06:30:00.000Z';
const REGISTRATION_CREATED_AT = '2026-09-20T15:45:00.000Z';

describe('getLogConsoleAppAnalyticsPeriod', () => {
  it('should span the last N UTC days including the current one for a day preset', () => {
    expect(
      getLogConsoleAppAnalyticsPeriod({
        range: { kind: 'preset', preset: '7d' },
        now: NOW,
        registrationCreatedAt: REGISTRATION_CREATED_AT,
      }),
    ).toEqual({
      periodStart: '2026-10-08T00:00:00Z',
      periodEnd: '2026-10-15T00:00:00Z',
    });
  });

  it('should span a full year for the year preset', () => {
    expect(
      getLogConsoleAppAnalyticsPeriod({
        range: { kind: 'preset', preset: '1y' },
        now: NOW,
        registrationCreatedAt: REGISTRATION_CREATED_AT,
      }),
    ).toEqual({
      periodStart: '2025-10-15T00:00:00Z',
      periodEnd: '2026-10-15T00:00:00Z',
    });
  });

  it('should start all time at the registration day', () => {
    expect(
      getLogConsoleAppAnalyticsPeriod({
        range: { kind: 'preset', preset: 'all' },
        now: NOW,
        registrationCreatedAt: REGISTRATION_CREATED_AT,
      }),
    ).toEqual({
      periodStart: '2026-09-20T00:00:00Z',
      periodEnd: '2026-10-15T00:00:00Z',
    });
  });

  it('should clamp all time to the metric retention for an old registration', () => {
    expect(
      getLogConsoleAppAnalyticsPeriod({
        range: { kind: 'preset', preset: 'all' },
        now: NOW,
        registrationCreatedAt: '2020-01-01T00:00:00.000Z',
      }),
    ).toEqual({
      periodStart: '2025-10-15T00:00:00Z',
      periodEnd: '2026-10-15T00:00:00Z',
    });
  });

  it('should include both bounds of a custom range as whole UTC days', () => {
    expect(
      getLogConsoleAppAnalyticsPeriod({
        range: {
          kind: 'custom',
          startDate: '2026-10-01',
          endDate: '2026-10-05',
        },
        now: NOW,
        registrationCreatedAt: REGISTRATION_CREATED_AT,
      }),
    ).toEqual({
      periodStart: '2026-10-01T00:00:00Z',
      periodEnd: '2026-10-06T00:00:00Z',
    });
  });

  it('should clamp a custom range longer than the retention to its last year', () => {
    expect(
      getLogConsoleAppAnalyticsPeriod({
        range: {
          kind: 'custom',
          startDate: '2020-01-01',
          endDate: '2026-10-05',
        },
        now: NOW,
        registrationCreatedAt: REGISTRATION_CREATED_AT,
      }),
    ).toEqual({
      periodStart: '2025-10-06T00:00:00Z',
      periodEnd: '2026-10-06T00:00:00Z',
    });
  });
});
