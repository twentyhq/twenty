import { NO_WIDGET_DASHBOARD_FILTER } from '@/page-layout/constants/NoWidgetDashboardFilter';
import { getWidgetDashboardFilterIndicators } from '@/page-layout/utils/getWidgetDashboardFilterIndicators';
import { PageLayoutFilterType, ViewFilterOperand } from 'twenty-shared/types';

const PERIOD = {
  id: 'period-filter-id',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
};
const SIGNED = {
  id: 'signed-filter-id',
  label: 'Signed',
  type: PageLayoutFilterType.DATE,
};

const valueFor = (pageLayoutFilterId: string) => ({
  pageLayoutFilterId,
  type: PageLayoutFilterType.DATE,
  conditions: [
    { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_MONTH' },
  ],
});

const FIELDS = [{ id: 'close-date-id', label: 'Close date' }];

describe('getWidgetDashboardFilterIndicators', () => {
  it('should name the field each applied filter resolved to', () => {
    expect(
      getWidgetDashboardFilterIndicators({
        dashboardFilters: {
          pageLayoutFilters: [PERIOD],
          values: [valueFor(PERIOD.id)],
        },
        widgetDashboardFilter: {
          ...NO_WIDGET_DASHBOARD_FILTER,
          appliedFields: [
            {
              pageLayoutFilterId: PERIOD.id,
              fieldMetadataId: 'close-date-id',
              source: 'GROUP_BY',
            },
          ],
        },
        fields: FIELDS,
      }),
    ).toEqual([
      {
        pageLayoutFilterId: PERIOD.id,
        label: 'Period',
        value: valueFor(PERIOD.id),
        fieldLabel: 'Close date',
      },
    ]);
  });

  it('should never show a field that has no label to name it', () => {
    expect(
      getWidgetDashboardFilterIndicators({
        dashboardFilters: {
          pageLayoutFilters: [PERIOD],
          values: [valueFor(PERIOD.id)],
        },
        widgetDashboardFilter: {
          ...NO_WIDGET_DASHBOARD_FILTER,
          appliedFields: [
            {
              pageLayoutFilterId: PERIOD.id,
              fieldMetadataId: 'unknown-field-id',
              source: 'OVERRIDE',
            },
          ],
        },
        fields: FIELDS,
      }),
    ).toEqual([]);
  });

  it('should mark filters with a value the widget is not filtered by', () => {
    expect(
      getWidgetDashboardFilterIndicators({
        dashboardFilters: {
          pageLayoutFilters: [PERIOD, SIGNED],
          values: [valueFor(PERIOD.id), valueFor(SIGNED.id)],
        },
        widgetDashboardFilter: {
          ...NO_WIDGET_DASHBOARD_FILTER,
          notAppliedPageLayoutFilterIds: [PERIOD.id],
          unresolvedPageLayoutFilterIds: [SIGNED.id],
        },
        fields: FIELDS,
      }).map(({ label, fieldLabel }) => ({ label, fieldLabel })),
    ).toEqual([
      { label: 'Period', fieldLabel: null },
      { label: 'Signed', fieldLabel: null },
    ]);
  });

  it('should show nothing for a filter without a value', () => {
    expect(
      getWidgetDashboardFilterIndicators({
        dashboardFilters: { pageLayoutFilters: [PERIOD], values: [] },
        widgetDashboardFilter: NO_WIDGET_DASHBOARD_FILTER,
        fields: FIELDS,
      }),
    ).toEqual([]);
  });
});
