import { removeDashboardFilterValuesFromSearchParams } from '@/page-layout/utils/removeDashboardFilterValuesFromSearchParams';

describe('removeDashboardFilterValuesFromSearchParams', () => {
  it('should remove every dashboard filter value and keep the other params', () => {
    expect(
      removeDashboardFilterValuesFromSearchParams(
        new URLSearchParams(
          'viewId=1&dashboardFilter[a][IS_RELATIVE]=PAST_7_DAY&dashboardFilter[b][IS_AFTER]=2026-01-01&dashboardFilter[b][IS_BEFORE]=2026-02-01&dashboardFilter[c]=&tab=2',
        ),
      ).toString(),
    ).toBe('viewId=1&tab=2');
  });

  it('should keep params that only start with the key', () => {
    expect(
      removeDashboardFilterValuesFromSearchParams(
        new URLSearchParams('dashboardFilterX=1'),
      ).toString(),
    ).toBe('dashboardFilterX=1');
  });
});
