import { DASHBOARD_PERIOD_FILTER_ID } from '@/page-layout/constants/DashboardPeriodFilterId';
import { getDashboardPageLayoutFilters } from '@/page-layout/utils/getDashboardPageLayoutFilters';
import { PageLayoutFilterType } from '~/generated-metadata/graphql';

const buildFilter = (id: string, position: number) => ({
  id,
  label: id,
  type: PageLayoutFilterType.DATE,
  position,
  defaultValue: null,
});

describe('getDashboardPageLayoutFilters', () => {
  it.each([null, undefined, []])(
    'should return the built-in Period when the filters are %p',
    (filters) => {
      expect(getDashboardPageLayoutFilters(filters)).toEqual([
        {
          id: DASHBOARD_PERIOD_FILTER_ID,
          label: 'Period',
          type: PageLayoutFilterType.DATE,
          position: 0,
          defaultValue: null,
        },
      ]);
    },
  );

  it('should return the stored filters sorted by position, without the built-in Period', () => {
    const signupFilter = buildFilter('signup', 1);
    const closeFilter = buildFilter('close', 0);

    expect(getDashboardPageLayoutFilters([signupFilter, closeFilter])).toEqual([
      closeFilter,
      signupFilter,
    ]);
  });
});
