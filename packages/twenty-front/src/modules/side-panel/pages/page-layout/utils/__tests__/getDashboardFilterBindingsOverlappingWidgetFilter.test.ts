import { getDashboardFilterBindingsOverlappingWidgetFilter } from '@/side-panel/pages/page-layout/utils/getDashboardFilterBindingsOverlappingWidgetFilter';

const CLOSE_DATE_FIELD_ID = 'close-date-field-id';
const CREATED_AT_FIELD_ID = 'created-at-field-id';

describe('getDashboardFilterBindingsOverlappingWidgetFilter', () => {
  const periodBinding = {
    pageLayoutFilterId: 'period-filter-id',
    fieldMetadataId: CLOSE_DATE_FIELD_ID,
  };

  it('should return a binding on a field the widget filter already uses', () => {
    expect(
      getDashboardFilterBindingsOverlappingWidgetFilter({
        dashboardFilterBindings: [periodBinding],
        pageLayoutFilterIds: ['period-filter-id'],
        widgetFilterFieldMetadataIds: [CLOSE_DATE_FIELD_ID],
      }),
    ).toEqual([periodBinding]);
  });

  it('should ignore a binding on a field the widget filter does not use', () => {
    expect(
      getDashboardFilterBindingsOverlappingWidgetFilter({
        dashboardFilterBindings: [periodBinding],
        pageLayoutFilterIds: ['period-filter-id'],
        widgetFilterFieldMetadataIds: [CREATED_AT_FIELD_ID],
      }),
    ).toEqual([]);
  });

  it('should ignore a binding to a filter the dashboard no longer has', () => {
    expect(
      getDashboardFilterBindingsOverlappingWidgetFilter({
        dashboardFilterBindings: [periodBinding],
        pageLayoutFilterIds: [],
        widgetFilterFieldMetadataIds: [CLOSE_DATE_FIELD_ID],
      }),
    ).toEqual([]);
  });
});
