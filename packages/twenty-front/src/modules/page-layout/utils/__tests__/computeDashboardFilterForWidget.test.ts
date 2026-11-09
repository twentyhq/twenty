import { computeDashboardFilterForWidget } from '@/page-layout/utils/computeDashboardFilterForWidget';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  FieldMetadataType,
  FirstDayOfTheWeek,
  PageLayoutFilterType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

const PERIOD_FILTER_ID = 'period-filter-id';

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
  pageLayoutFilterId: PERIOD_FILTER_ID,
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

const RECORD_TABLE_CONFIGURATION = {
  __typename: 'RecordTableConfiguration',
  configurationType: WidgetConfigurationType.RECORD_TABLE,
} as PageLayoutWidget['configuration'];

const AGGREGATE_CONFIGURATION = {
  __typename: 'AggregateChartConfiguration',
  configurationType: WidgetConfigurationType.AGGREGATE_CHART,
} as PageLayoutWidget['configuration'];

describe('computeDashboardFilterForWidget', () => {
  it('should apply a filter on createdAt by default', () => {
    expect(
      computeDashboardFilterForWidget({
        dashboardFilters: DASHBOARD_FILTERS,
        configuration: AGGREGATE_CONFIGURATION,
        fields: [CLOSE_DATE_FIELD, CREATED_AT_FIELD],
        viewFilterFieldMetadataIds: [],
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
          pageLayoutFilterId: PERIOD_FILTER_ID,
          fieldMetadataId: CREATED_AT_FIELD.id,
          source: 'CREATED_AT',
        },
      ],
      notAppliedPageLayoutFilterIds: [],
      unresolvedPageLayoutFilterIds: [],
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
      viewFilterFieldMetadataIds: [CLOSE_DATE_FIELD.id],
      filterValueDependencies: {},
    });

    expect(appliedFields).toEqual([
      {
        pageLayoutFilterId: PERIOD_FILTER_ID,
        fieldMetadataId: CLOSE_DATE_FIELD.id,
        source: 'WIDGET_FILTER',
      },
    ]);
  });

  it('should report a widget set to not applied', () => {
    const { recordFilters, notAppliedPageLayoutFilterIds } =
      computeDashboardFilterForWidget({
        dashboardFilters: DASHBOARD_FILTERS,
        configuration: {
          ...RECORD_TABLE_CONFIGURATION,
          dashboardFilterBindings: [
            { pageLayoutFilterId: PERIOD_FILTER_ID, fieldMetadataId: null },
          ],
        } as PageLayoutWidget['configuration'],
        fields: [CREATED_AT_FIELD],
        viewFilterFieldMetadataIds: [],
        filterValueDependencies: {},
      });

    expect(recordFilters).toEqual([]);
    expect(notAppliedPageLayoutFilterIds).toEqual([PERIOD_FILTER_ID]);
  });

  it('should ignore widgets that show no records', () => {
    expect(
      computeDashboardFilterForWidget({
        dashboardFilters: DASHBOARD_FILTERS,
        configuration: {
          __typename: 'IframeConfiguration',
          configurationType: WidgetConfigurationType.IFRAME,
        } as PageLayoutWidget['configuration'],
        fields: [],
        viewFilterFieldMetadataIds: [],
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
        viewFilterFieldMetadataIds: [],
        filterValueDependencies: {},
      }).isInvalid,
    ).toBe(true);
  });
});
