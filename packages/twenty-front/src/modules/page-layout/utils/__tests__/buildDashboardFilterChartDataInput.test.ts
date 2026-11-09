import { buildDashboardFilterChartDataInput } from '@/page-layout/utils/buildDashboardFilterChartDataInput';
import { PageLayoutFilterType, ViewFilterOperand } from 'twenty-shared/types';

describe('buildDashboardFilterChartDataInput', () => {
  it('should send only the time zone when no dashboard filter has a value', () => {
    expect(
      buildDashboardFilterChartDataInput({
        values: [],
        viewerTimeZone: 'Europe/Paris',
      }),
    ).toEqual({ viewerTimeZone: 'Europe/Paris' });
  });

  it('should send every value with the time zone it resolves in', () => {
    const values = [
      {
        pageLayoutFilterId: 'date-range-filter-id',
        type: PageLayoutFilterType.DATE,
        conditions: [
          { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
        ],
      },
    ];

    expect(
      buildDashboardFilterChartDataInput({
        values,
        viewerTimeZone: 'Europe/Paris',
      }),
    ).toEqual({
      dashboardFilterValues: values,
      viewerTimeZone: 'Europe/Paris',
    });
  });
});
