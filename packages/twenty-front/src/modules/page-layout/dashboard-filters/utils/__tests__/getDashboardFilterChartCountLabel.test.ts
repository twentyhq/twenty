import { getDashboardFilterChartCountLabel } from '@/page-layout/dashboard-filters/utils/getDashboardFilterChartCountLabel';

describe('getDashboardFilterChartCountLabel', () => {
  it('pluralizes the chart count', () => {
    expect(
      getDashboardFilterChartCountLabel({ boundChartCount: 1, chartCount: 1 }),
    ).toBe('1 of 1 chart');
    expect(
      getDashboardFilterChartCountLabel({ boundChartCount: 0, chartCount: 3 }),
    ).toBe('0 of 3 charts');
  });
});
