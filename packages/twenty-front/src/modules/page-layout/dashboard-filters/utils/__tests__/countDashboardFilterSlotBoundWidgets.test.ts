import { countDashboardFilterSlotBoundWidgets } from '@/page-layout/dashboard-filters/utils/countDashboardFilterSlotBoundWidgets';

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

describe('countDashboardFilterSlotBoundWidgets', () => {
  it('counts widgets with a non-null binding against all known widgets', () => {
    expect(
      countDashboardFilterSlotBoundWidgets({
        slotId: 'owner',
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toEqual({ boundWidgetCount: 1, totalWidgetCount: 3 });

    expect(
      countDashboardFilterSlotBoundWidgets({
        slotId: 'date',
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toEqual({ boundWidgetCount: 2, totalWidgetCount: 3 });
  });

  it('counts zero bound widgets for an unknown slot', () => {
    expect(
      countDashboardFilterSlotBoundWidgets({
        slotId: 'unknown',
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toEqual({ boundWidgetCount: 0, totalWidgetCount: 3 });
  });

  it('returns zeros without widgets', () => {
    expect(
      countDashboardFilterSlotBoundWidgets({
        slotId: 'date',
        bindingsByWidgetId: {},
      }),
    ).toEqual({ boundWidgetCount: 0, totalWidgetCount: 0 });
  });
});
