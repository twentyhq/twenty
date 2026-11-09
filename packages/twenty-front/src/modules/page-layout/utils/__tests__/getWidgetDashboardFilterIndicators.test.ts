import { DASHBOARD_DATE_RANGE_FILTER_ID } from '@/page-layout/constants/DashboardDateRangeFilterId';
import { NO_WIDGET_DASHBOARD_FILTER } from '@/page-layout/constants/NoWidgetDashboardFilter';
import { getWidgetDashboardFilterIndicators } from '@/page-layout/utils/getWidgetDashboardFilterIndicators';
import { PageLayoutFilterType, ViewFilterOperand } from 'twenty-shared/types';

// Stored by a French editor: the built-in Date range still shows in the viewer's locale
const DATE_RANGE = {
  id: DASHBOARD_DATE_RANGE_FILTER_ID,
  label: 'Période',
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

const FIELDS = [
  { id: 'close-date-id', label: 'Close date' },
  { id: 'created-at-id', label: 'Created at' },
];

const getIndicators = (
  widgetDashboardFilter: Partial<typeof NO_WIDGET_DASHBOARD_FILTER>,
  values = [valueFor(DATE_RANGE.id), valueFor(SIGNED.id)],
) =>
  getWidgetDashboardFilterIndicators({
    dashboardFilters: { pageLayoutFilters: [DATE_RANGE, SIGNED], values },
    widgetDashboardFilter: {
      ...NO_WIDGET_DASHBOARD_FILTER,
      ...widgetDashboardFilter,
    },
    fields: FIELDS,
  });

describe('getWidgetDashboardFilterIndicators', () => {
  it('should show nothing for a widget that follows the filters by default', () => {
    expect(
      getIndicators({
        appliedFields: [
          {
            pageLayoutFilterId: DATE_RANGE.id,
            fieldMetadataId: 'close-date-id',
            source: 'GROUP_BY',
          },
          {
            pageLayoutFilterId: SIGNED.id,
            fieldMetadataId: 'created-at-id',
            source: 'CREATED_AT',
          },
        ],
      }),
    ).toEqual([]);
  });

  it('should name the field of an override', () => {
    expect(
      getIndicators({
        appliedFields: [
          {
            pageLayoutFilterId: DATE_RANGE.id,
            fieldMetadataId: 'created-at-id',
            source: 'OVERRIDE',
          },
        ],
      }),
    ).toEqual([
      {
        pageLayoutFilterId: DATE_RANGE.id,
        label: 'Date range',
        kind: 'OVERRIDE',
        fieldLabel: 'Created at',
      },
    ]);
  });

  it('should never show an override field that has no label to name it', () => {
    expect(
      getIndicators({
        appliedFields: [
          {
            pageLayoutFilterId: DATE_RANGE.id,
            fieldMetadataId: 'unknown-field-id',
            source: 'OVERRIDE',
          },
        ],
      }),
    ).toEqual([]);
  });

  it('should tell an ignored filter from an unresolved one', () => {
    expect(
      getIndicators({
        notAppliedPageLayoutFilterIds: [DATE_RANGE.id],
        unresolvedPageLayoutFilterIds: [SIGNED.id],
      }).map(({ label, kind }) => ({ label, kind })),
    ).toEqual([
      { label: 'Date range', kind: 'IGNORED' },
      { label: 'Signed', kind: 'UNRESOLVED' },
    ]);
  });

  it('should show nothing for a filter without a value', () => {
    expect(
      getIndicators({ notAppliedPageLayoutFilterIds: [DATE_RANGE.id] }, []),
    ).toEqual([]);
  });
});
