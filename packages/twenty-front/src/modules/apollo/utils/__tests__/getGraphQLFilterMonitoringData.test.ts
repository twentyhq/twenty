import { getGraphQLFilterMonitoringData } from '@/apollo/utils/getGraphQLFilterMonitoringData';

describe('getGraphQLFilterMonitoringData', () => {
  it('classifies nested filter shapes without exposing filter values', () => {
    const monitoringData = getGraphQLFilterMonitoringData({
      filter: {
        accountOwner: {
          name: {
            lt: 'sensitive-value',
          },
        },
      },
      viewId: 'view-id',
    });

    expect(monitoringData.filterShape).toBe('nested-object-filter');
    expect(monitoringData.filterKeyHash).not.toBe('none');
    expect(monitoringData.viewIdHash).not.toBe('view-id');
    expect(JSON.stringify(monitoringData)).not.toContain('sensitive-value');
  });

  it('classifies operator filters and missing view identifiers', () => {
    expect(
      getGraphQLFilterMonitoringData({
        filter: { name: { eq: 'value' } },
      }),
    ).toEqual({
      filterShape: 'operator-filter',
      filterKeyHash: 'none',
      viewIdHash: 'none',
    });

    expect(getGraphQLFilterMonitoringData(undefined)).toEqual({
      filterShape: 'missing',
      filterKeyHash: 'none',
      viewIdHash: 'none',
    });
  });
});
