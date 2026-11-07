import { buildDashboardFilterChartDataInput } from '@/page-layout/utils/buildDashboardFilterChartDataInput';
import { ViewFilterOperand } from 'twenty-shared/types';

describe('buildDashboardFilterChartDataInput', () => {
  it('should send nothing when the widget has no bound value', () => {
    expect(
      buildDashboardFilterChartDataInput({
        boundDashboardFilterValues: [],
        timeZone: 'Europe/Paris',
      }),
    ).toEqual({});
  });

  it('should send the bound values with the time zone they resolve in', () => {
    const boundDashboardFilterValues = [
      {
        pageLayoutFilterId: 'period-filter-id',
        conditions: [
          { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
        ],
      },
    ];

    expect(
      buildDashboardFilterChartDataInput({
        boundDashboardFilterValues,
        timeZone: 'Europe/Paris',
      }),
    ).toEqual({
      dashboardFilterValues: boundDashboardFilterValues,
      dashboardFilterTimeZone: 'Europe/Paris',
    });
  });
});
