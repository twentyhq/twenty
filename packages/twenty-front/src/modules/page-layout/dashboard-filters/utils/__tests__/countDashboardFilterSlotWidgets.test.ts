import { countDashboardFilterSlotWidgets } from '@/page-layout/dashboard-filters/utils/countDashboardFilterSlotWidgets';
import { WidgetType } from '~/generated-metadata/graphql';

const WIDGETS = [
  { id: 'graph-bound', type: WidgetType.GRAPH },
  { id: 'graph-null-binding', type: WidgetType.GRAPH },
  { id: 'graph-no-entry', type: WidgetType.GRAPH },
  { id: 'graph-other-slot-only', type: WidgetType.GRAPH },
  { id: 'record-table', type: WidgetType.RECORD_TABLE },
  { id: 'iframe', type: WidgetType.IFRAME },
];

const BINDINGS_BY_WIDGET_ID = {
  'graph-bound': { date: { fieldMetadataId: 'created-at-id' } },
  'graph-null-binding': { date: null },
  'graph-other-slot-only': { owner: { fieldMetadataId: 'owner-id' } },
  'record-table': { date: { fieldMetadataId: 'created-at-id' } },
};

describe('countDashboardFilterSlotWidgets', () => {
  it('counts graph widgets and those with a non-null binding for the slot', () => {
    expect(
      countDashboardFilterSlotWidgets({
        slotId: 'date',
        widgets: WIDGETS,
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toEqual({ boundWidgetCount: 1, graphWidgetCount: 4 });
  });

  it('counts zero bound widgets for a slot nobody binds', () => {
    expect(
      countDashboardFilterSlotWidgets({
        slotId: 'city',
        widgets: WIDGETS,
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toEqual({ boundWidgetCount: 0, graphWidgetCount: 4 });
  });

  it('returns zeros for a layout without graph widgets', () => {
    expect(
      countDashboardFilterSlotWidgets({
        slotId: 'date',
        widgets: [{ id: 'iframe', type: WidgetType.IFRAME }],
        bindingsByWidgetId: {},
      }),
    ).toEqual({ boundWidgetCount: 0, graphWidgetCount: 0 });
  });
});
