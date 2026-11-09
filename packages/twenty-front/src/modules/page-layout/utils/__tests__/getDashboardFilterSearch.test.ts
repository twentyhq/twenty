import { getDashboardFilterSearch } from '@/page-layout/utils/getDashboardFilterSearch';

describe('getDashboardFilterSearch', () => {
  it('should keep only the dashboard filter params, in order', () => {
    expect(
      getDashboardFilterSearch(
        new URLSearchParams(
          'viewId=1&dashboardFilter[a][IS_RELATIVE]=THIS_1_MONTH&tab=2&dashboardFilter[b]=',
        ),
      ),
    ).toBe(
      new URLSearchParams(
        'dashboardFilter[a][IS_RELATIVE]=THIS_1_MONTH&dashboardFilter[b]=',
      ).toString(),
    );
  });

  it('should return the same string when only other params change', () => {
    const search = 'dashboardFilter[a][IS_RELATIVE]=THIS_1_MONTH';

    expect(
      getDashboardFilterSearch(new URLSearchParams(`${search}&viewId=1`)),
    ).toBe(getDashboardFilterSearch(new URLSearchParams(`${search}&viewId=2`)));
  });

  it('should ignore params that only start with the key', () => {
    expect(
      getDashboardFilterSearch(new URLSearchParams('dashboardFilterX=1')),
    ).toBe('');
  });
});
