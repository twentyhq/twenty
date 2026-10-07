import { applyDashboardFilterValuesToSearchParams } from '@/page-layout/dashboard-filters/utils/applyDashboardFilterValuesToSearchParams';
import { ViewFilterOperand } from 'twenty-shared/types';

describe('applyDashboardFilterValuesToSearchParams', () => {
  it('writes operand and value params for each defined slot value', () => {
    const nextSearchParams = applyDashboardFilterValuesToSearchParams({
      searchParams: new URLSearchParams(),
      dashboardFilterValues: {
        date: { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
        owner: undefined,
      },
    });

    expect(nextSearchParams.get('dashboardFilter[date][operand]')).toBe(
      'IS_AFTER',
    );
    expect(nextSearchParams.get('dashboardFilter[date][value]')).toBe(
      '2026-01-01',
    );
    expect(nextSearchParams.has('dashboardFilter[owner][operand]')).toBe(false);
  });

  it('removes the params of a cleared slot and keeps other query params', () => {
    const searchParams = new URLSearchParams();
    searchParams.set('viewId', 'view-id');
    searchParams.set('filter[name][IS]', 'Acme');
    searchParams.set('dashboardFilter[date][operand]', 'IS_AFTER');
    searchParams.set('dashboardFilter[date][value]', '2026-01-01');

    const nextSearchParams = applyDashboardFilterValuesToSearchParams({
      searchParams,
      dashboardFilterValues: {},
    });

    expect(Array.from(nextSearchParams.keys())).toEqual([
      'viewId',
      'filter[name][IS]',
    ]);
    expect(nextSearchParams.get('viewId')).toBe('view-id');
  });

  it('does not mutate the given search params', () => {
    const searchParams = new URLSearchParams('viewId=view-id');

    applyDashboardFilterValuesToSearchParams({
      searchParams,
      dashboardFilterValues: {
        date: { operand: ViewFilterOperand.IS_TODAY, value: '' },
      },
    });

    expect(searchParams.toString()).toBe('viewId=view-id');
  });
});
