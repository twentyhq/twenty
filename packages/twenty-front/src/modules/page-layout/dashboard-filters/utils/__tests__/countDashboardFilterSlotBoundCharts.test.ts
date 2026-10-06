import { countDashboardFilterSlotBoundCharts } from '@/page-layout/dashboard-filters/utils/countDashboardFilterSlotBoundCharts';

const BINDINGS_BY_WIDGET_ID = {
  'chart-1': {
    date: { fieldMetadataId: 'chart-1-created-at' },
    owner: { fieldMetadataId: 'chart-1-owner' },
  },
  'chart-2': {
    date: { fieldMetadataId: 'chart-2-created-at' },
    owner: null,
  },
  'chart-3': {
    date: null,
    owner: null,
  },
};

describe('countDashboardFilterSlotBoundCharts', () => {
  it('counts charts with a non-null binding against all known charts', () => {
    expect(
      countDashboardFilterSlotBoundCharts({
        slotId: 'owner',
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toEqual({ boundChartCount: 1, chartCount: 3 });

    expect(
      countDashboardFilterSlotBoundCharts({
        slotId: 'date',
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toEqual({ boundChartCount: 2, chartCount: 3 });
  });

  it('counts zero bound charts for an unknown slot', () => {
    expect(
      countDashboardFilterSlotBoundCharts({
        slotId: 'unknown',
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toEqual({ boundChartCount: 0, chartCount: 3 });
  });

  it('returns zeros without charts', () => {
    expect(
      countDashboardFilterSlotBoundCharts({
        slotId: 'date',
        bindingsByWidgetId: {},
      }),
    ).toEqual({ boundChartCount: 0, chartCount: 0 });
  });
});
