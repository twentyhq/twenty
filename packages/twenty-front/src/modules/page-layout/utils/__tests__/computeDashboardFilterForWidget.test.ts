import { type DashboardFilterWidgetConfiguration } from '@/page-layout/types/DashboardFilterWidgetConfiguration';
import { computeDashboardFilterForWidget } from '@/page-layout/utils/computeDashboardFilterForWidget';
import {
  FieldMetadataType,
  FirstDayOfTheWeek,
  PageLayoutFilterType,
  ViewFilterOperand,
} from 'twenty-shared/types';

const DATE_RANGE_FILTER_ID = 'date-range-filter-id';

const CLOSE_DATE_FIELD = {
  id: 'close-date-id',
  name: 'closeDate',
  label: 'Close date',
  type: FieldMetadataType.DATE,
};
const CREATED_AT_FIELD = {
  id: 'created-at-id',
  name: 'createdAt',
  label: 'Creation date',
  type: FieldMetadataType.DATE_TIME,
};

const THIS_MONTH_VALUE = {
  pageLayoutFilterId: DATE_RANGE_FILTER_ID,
  type: PageLayoutFilterType.DATE,
  conditions: [
    {
      operand: ViewFilterOperand.IS_RELATIVE,
      value: 'THIS_1_MONTH;;Asia/Tokyo;;MONDAY;;',
    },
  ],
};

const DASHBOARD_FILTERS = {
  values: [THIS_MONTH_VALUE],
  timeZone: 'Asia/Tokyo',
  firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
};

const filterOn = (
  ...recordFilters: {
    id?: string;
    fieldMetadataId: string;
    operand: ViewFilterOperand;
    value?: string;
  }[]
) => ({
  recordFilters,
  recordFilterGroups: [],
});

const NO_WIDGET_FILTER = filterOn();

const RECORD_TABLE_CONFIGURATION: DashboardFilterWidgetConfiguration = {
  __typename: 'RecordTableConfiguration',
};

const AGGREGATE_CONFIGURATION: DashboardFilterWidgetConfiguration = {
  __typename: 'AggregateChartConfiguration',
};

describe('computeDashboardFilterForWidget', () => {
  it('should apply a filter on createdAt by default', () => {
    expect(
      computeDashboardFilterForWidget({
        dashboardFilters: DASHBOARD_FILTERS,
        configuration: AGGREGATE_CONFIGURATION,
        fields: [CLOSE_DATE_FIELD, CREATED_AT_FIELD],
        widgetFilter: NO_WIDGET_FILTER,
        filterValueDependencies: {},
      }),
    ).toEqual({
      recordFilters: [
        {
          fieldMetadataId: CREATED_AT_FIELD.id,
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'THIS_1_MONTH;;Asia/Tokyo;;MONDAY;;',
        },
      ],
      appliedFields: [
        {
          pageLayoutFilterId: DATE_RANGE_FILTER_ID,
          fieldMetadataId: CREATED_AT_FIELD.id,
          source: 'CREATED_AT',
        },
      ],
      notAppliedPageLayoutFilterIds: [],
      unresolvedPageLayoutFilterIds: [],
      replacedWidgetRecordFilterIds: [],
      isInvalid: false,
      gqlOperationFilter: {
        and: [
          { createdAt: { gte: expect.any(String) } },
          { createdAt: { lt: expect.any(String) } },
        ],
      },
    });
  });

  it('should resolve a record table on a date its view filters on', () => {
    const { appliedFields } = computeDashboardFilterForWidget({
      dashboardFilters: DASHBOARD_FILTERS,
      configuration: RECORD_TABLE_CONFIGURATION,
      fields: [CLOSE_DATE_FIELD, CREATED_AT_FIELD],
      widgetFilter: filterOn({
        fieldMetadataId: CLOSE_DATE_FIELD.id,
        operand: ViewFilterOperand.IS_IN_PAST,
      }),
      filterValueDependencies: {},
    });

    expect(appliedFields).toEqual([
      {
        pageLayoutFilterId: DATE_RANGE_FILTER_ID,
        fieldMetadataId: CLOSE_DATE_FIELD.id,
        source: 'WIDGET_FILTER',
      },
    ]);
  });

  it("should list the widget's own period the value replaces", () => {
    expect(
      computeDashboardFilterForWidget({
        dashboardFilters: DASHBOARD_FILTERS,
        configuration: RECORD_TABLE_CONFIGURATION,
        fields: [CLOSE_DATE_FIELD, CREATED_AT_FIELD],
        widgetFilter: filterOn(
          {
            id: 'this-quarter',
            fieldMetadataId: CLOSE_DATE_FIELD.id,
            operand: ViewFilterOperand.IS_RELATIVE,
            value: 'THIS_1_QUARTER',
          },
          {
            id: 'in-the-past',
            fieldMetadataId: CLOSE_DATE_FIELD.id,
            operand: ViewFilterOperand.IS_IN_PAST,
          },
        ),
        filterValueDependencies: {},
      }).replacedWidgetRecordFilterIds,
    ).toEqual(['this-quarter']);
  });

  it('should report a widget set to not applied', () => {
    const { recordFilters, notAppliedPageLayoutFilterIds } =
      computeDashboardFilterForWidget({
        dashboardFilters: DASHBOARD_FILTERS,
        configuration: {
          ...RECORD_TABLE_CONFIGURATION,
          dashboardFilterBindings: [
            { pageLayoutFilterId: DATE_RANGE_FILTER_ID, fieldMetadataId: null },
          ],
        },
        fields: [CREATED_AT_FIELD],
        widgetFilter: NO_WIDGET_FILTER,
        filterValueDependencies: {},
      });

    expect(recordFilters).toEqual([]);
    expect(notAppliedPageLayoutFilterIds).toEqual([DATE_RANGE_FILTER_ID]);
  });

  it('should ignore widgets that show no records', () => {
    expect(
      computeDashboardFilterForWidget({
        dashboardFilters: DASHBOARD_FILTERS,
        configuration: {
          __typename: 'IframeConfiguration',
        },
        fields: [],
        widgetFilter: NO_WIDGET_FILTER,
        filterValueDependencies: {},
      }).unresolvedPageLayoutFilterIds,
    ).toEqual([]);
  });

  it('should mark the widget invalid when a value cannot be resolved', () => {
    expect(
      computeDashboardFilterForWidget({
        dashboardFilters: {
          ...DASHBOARD_FILTERS,
          values: [
            {
              ...THIS_MONTH_VALUE,
              conditions: [
                { operand: ViewFilterOperand.IS_AFTER, value: 'not-a-date' },
              ],
            },
          ],
        },
        configuration: AGGREGATE_CONFIGURATION,
        fields: [CREATED_AT_FIELD],
        widgetFilter: NO_WIDGET_FILTER,
        filterValueDependencies: {},
      }).isInvalid,
    ).toBe(true);
  });
});
