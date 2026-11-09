import { DASHBOARD_DATE_RANGE_FILTER_ID } from '@/page-layout/constants/DashboardDateRangeFilterId';
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
    'should return the built-in Date range when the filters are %p',
    (filters) => {
      expect(getDashboardPageLayoutFilters(filters)).toEqual([
        {
          id: DASHBOARD_DATE_RANGE_FILTER_ID,
          label: 'Date range',
          type: PageLayoutFilterType.DATE,
          position: 0,
          defaultValue: null,
        },
      ]);
    },
  );

  it('should return the stored filters sorted by position, without the built-in Date range', () => {
    const signupFilter = buildFilter('signup', 1);
    const closeFilter = buildFilter('close', 0);

    expect(getDashboardPageLayoutFilters([signupFilter, closeFilter])).toEqual([
      closeFilter,
      signupFilter,
    ]);
  });
});
