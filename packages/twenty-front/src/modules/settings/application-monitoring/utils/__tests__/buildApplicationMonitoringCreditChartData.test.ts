import { buildApplicationMonitoringCreditChartData } from '@/settings/application-monitoring/utils/buildApplicationMonitoringCreditChartData';

describe('buildApplicationMonitoringCreditChartData', () => {
  it('should split credits by declared operation label, else by operation type, largest total first, and fill the buckets without usage', () => {
    expect(
      buildApplicationMonitoringCreditChartData({
        periodStart: '2026-10-16T08:00:00.000Z',
        periodEnd: '2026-10-19T08:00:00.000Z',
        bucketSizeInSeconds: 24 * 60 * 60,
        creditUsage: [
          {
            bucketStart: '2026-10-17T00:00:00.000Z',
            operationType: 'CODE_EXECUTION',
            operationLabel: null,
            operationIcon: null,
            creditsUsed: 2.5,
            __typename: 'ApplicationMonitoringCreditBucket',
          },
          {
            bucketStart: '2026-10-17T00:00:00.000Z',
            operationType: 'APP_OPERATION',
            operationLabel: 'SMS sent',
            operationIcon: 'IconMessage',
            creditsUsed: 4,
            __typename: 'ApplicationMonitoringCreditBucket',
          },
          {
            bucketStart: '2026-10-18T00:00:00.000Z',
            operationType: 'CODE_EXECUTION',
            operationLabel: null,
            operationIcon: null,
            creditsUsed: 1,
            __typename: 'ApplicationMonitoringCreditBucket',
          },
        ],
      }),
    ).toEqual({
      series: [
        {
          key: 'label:SMS sent',
          operationType: 'APP_OPERATION',
          operationLabel: 'SMS sent',
          operationIcon: 'IconMessage',
        },
        {
          key: 'operation:CODE_EXECUTION',
          operationType: 'CODE_EXECUTION',
          operationLabel: null,
          operationIcon: null,
        },
      ],
      data: [
        {
          bucketStart: '2026-10-16T00:00:00.000Z',
          'label:SMS sent': 0,
          'operation:CODE_EXECUTION': 0,
        },
        {
          bucketStart: '2026-10-17T00:00:00.000Z',
          'label:SMS sent': 4,
          'operation:CODE_EXECUTION': 2.5,
        },
        {
          bucketStart: '2026-10-18T00:00:00.000Z',
          'label:SMS sent': 0,
          'operation:CODE_EXECUTION': 1,
        },
        {
          bucketStart: '2026-10-19T00:00:00.000Z',
          'label:SMS sent': 0,
          'operation:CODE_EXECUTION': 0,
        },
      ],
    });
  });
});
