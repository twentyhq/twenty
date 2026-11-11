import { getDashboardFilterSessionSearch } from '@/page-layout/utils/getDashboardFilterSessionSearch';
import { DASHBOARD_DATE_RANGE_FILTER_ID } from 'twenty-shared/constants';

const KEY = `dashboardFilter[${DASHBOARD_DATE_RANGE_FILTER_ID}]`;

const getSessionSearch = (entries: [string, string][]) =>
  getDashboardFilterSessionSearch(new URLSearchParams(entries));

describe('getDashboardFilterSessionSearch', () => {
  it('should keep a valid value and drop the other params', () => {
    expect(
      getSessionSearch([
        ['tab', 'overview'],
        [`${KEY}[IS_RELATIVE]`, 'PAST_7_DAY'],
      ]),
    ).toBe(
      new URLSearchParams([[`${KEY}[IS_RELATIVE]`, 'PAST_7_DAY']]).toString(),
    );
  });

  it('should keep an explicit empty value', () => {
    expect(getSessionSearch([[KEY, '']])).toBe(
      new URLSearchParams([[KEY, '']]).toString(),
    );
  });

  it('should drop a value the bar cannot apply', () => {
    expect(getSessionSearch([[`${KEY}[IS_RELATIVE]`, 'garbage']])).toBe('');
  });
});
