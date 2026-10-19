import { mapApplicationMonitoringRows } from 'src/engine/core-modules/application/application-monitoring/utils/map-application-monitoring-rows.util';

const PERIOD = {
  periodStart: new Date('2026-10-12T08:00:00.000Z'),
  periodEnd: new Date('2026-10-19T08:00:00.000Z'),
  bucketSizeInSeconds: 86400,
};

const EMPTY_ROWS = {
  totals: [],
  activity: [],
  lifecycle: [],
  issues: [],
  versions: [],
  functions: [],
};

describe('mapApplicationMonitoringRows', () => {
  it('returns zero counts when ClickHouse returns nothing', () => {
    expect(
      mapApplicationMonitoringRows({
        period: PERIOD,
        lookbackInHours: 2160,
        rows: EMPTY_ROWS,
      }),
    ).toEqual({
      ...PERIOD,
      lookbackInHours: 2160,
      runCount: 0,
      failedRunCount: 0,
      lifecycleFailureCount: 0,
      rateLimitEventCount: 0,
      activity: [],
      lifecycle: [],
      issues: [],
      versions: [],
      functions: [],
    });
  });

  it('converts ClickHouse 64-bit counts and UTC timestamps', () => {
    const monitoring = mapApplicationMonitoringRows({
      period: PERIOD,
      lookbackInHours: 2160,
      rows: {
        ...EMPTY_ROWS,
        totals: [
          {
            runCount: '7930',
            failedRunCount: '139',
            lifecycleFailureCount: '3',
            rateLimitEventCount: '61',
          },
        ],
        activity: [
          {
            bucketStart: '2026-10-17 00:00:00.000',
            errorCount: '41',
            warningCount: '33',
            infoCount: '1100',
          },
        ],
        issues: [
          {
            level: 'ERROR',
            source: 'LOGIC_FUNCTION',
            errorCode: 'AUTHENTICATION_FAILED',
            logicFunctionName: 'syncContacts',
            versions: ['1.2.3', ''],
            eventCount: '96',
            affectedInstallCount: '5',
            lastSeenAt: '2026-10-19 08:41:12.204',
          },
        ],
        functions: [
          {
            logicFunctionName: 'syncContacts',
            runCount: '4210',
            failedRunCount: '96',
            p95DurationMs: 1399.9999999999998,
          },
        ],
      },
    });

    expect(monitoring).toMatchObject({
      runCount: 7930,
      failedRunCount: 139,
      lifecycleFailureCount: 3,
      rateLimitEventCount: 61,
      activity: [
        {
          bucketStart: new Date('2026-10-17T00:00:00.000Z'),
          errorCount: 41,
          warningCount: 33,
          infoCount: 1100,
        },
      ],
      issues: [
        {
          versions: ['1.2.3'],
          eventCount: 96,
          affectedInstallCount: 5,
          lastSeenAt: new Date('2026-10-19T08:41:12.204Z'),
        },
      ],
      functions: [{ runCount: 4210, failedRunCount: 96, p95DurationMs: 1400 }],
    });
  });
});
