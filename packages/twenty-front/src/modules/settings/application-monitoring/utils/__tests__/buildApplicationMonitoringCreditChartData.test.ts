import { buildApplicationMonitoringCreditChartData } from '@/settings/application-monitoring/utils/buildApplicationMonitoringCreditChartData';

describe('buildApplicationMonitoringCreditChartData', () => {
  it('should split credits by operation type, declared ones included, largest total first, and fill the buckets without usage', () => {
    expect(
      buildApplicationMonitoringCreditChartData({
        periodStart: '2026-10-16T08:00:00.000Z',
        periodEnd: '2026-10-19T08:00:00.000Z',
        bucketSizeInSeconds: 24 * 60 * 60,
        creditUsage: [
          {
            bucketStart: '2026-10-17T00:00:00.000Z',
            operationType: 'CODE_EXECUTION',
            creditsUsed: 2.5,
          },
          {
            bucketStart: '2026-10-17T00:00:00.000Z',
            operationType: 'sendSms',
            creditsUsed: 4,
          },
          {
            bucketStart: '2026-10-18T00:00:00.000Z',
            operationType: 'CODE_EXECUTION',
            creditsUsed: 1,
          },
        ],
      }),
    ).toEqual({
      series: [
        { key: 'operation:sendSms', operationType: 'sendSms' },
        { key: 'operation:CODE_EXECUTION', operationType: 'CODE_EXECUTION' },
      ],
      data: [
        {
          bucketStart: '2026-10-16T00:00:00.000Z',
          'operation:sendSms': 0,
          'operation:CODE_EXECUTION': 0,
        },
        {
          bucketStart: '2026-10-17T00:00:00.000Z',
          'operation:sendSms': 4,
          'operation:CODE_EXECUTION': 2.5,
        },
        {
          bucketStart: '2026-10-18T00:00:00.000Z',
          'operation:sendSms': 0,
          'operation:CODE_EXECUTION': 1,
        },
        {
          bucketStart: '2026-10-19T00:00:00.000Z',
          'operation:sendSms': 0,
          'operation:CODE_EXECUTION': 0,
        },
      ],
    });
  });
});
