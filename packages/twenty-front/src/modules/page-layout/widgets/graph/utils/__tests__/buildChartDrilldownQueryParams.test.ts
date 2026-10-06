import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { appendRecordFiltersToChartFilter } from '@/page-layout/dashboard-filters/utils/appendRecordFiltersToChartFilter';
import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
import {
  type DashboardFilterSlot,
  FieldMetadataType,
  FirstDayOfTheWeek,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { buildRecordFilterFromDashboardFilterSlot } from 'twenty-shared/utils';
import { type BarChartConfiguration } from '~/generated-metadata/graphql';

const STATUS_FIELD = {
  id: 'field-status',
  name: 'status',
  type: FieldMetadataType.SELECT,
  label: 'Status',
};

const CREATED_AT_FIELD = {
  id: 'field-created-at',
  name: 'createdAt',
  type: FieldMetadataType.DATE_TIME,
  label: 'Created at',
};

const AMOUNT_FIELD = {
  id: 'field-amount',
  name: 'amount',
  type: FieldMetadataType.NUMBER,
  label: 'Amount',
};

const objectMetadataItem = {
  id: 'object-opportunity',
  nameSingular: 'opportunity',
  namePlural: 'opportunities',
  fields: [STATUS_FIELD, CREATED_AT_FIELD, AMOUNT_FIELD],
} as EnrichedObjectMetadataItem;

const DATE_SLOT: DashboardFilterSlot = {
  id: 'date',
  label: 'Date',
  filterType: 'DATE_TIME',
};

const dashboardDateRecordFilter = buildRecordFilterFromDashboardFilterSlot({
  slot: DATE_SLOT,
  binding: { fieldMetadataId: CREATED_AT_FIELD.id },
  value: { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_7_DAY' },
  fieldMetadataItem: CREATED_AT_FIELD,
});

const BASE_CONFIGURATION = {
  __typename: 'BarChartConfiguration',
  aggregateFieldMetadataId: AMOUNT_FIELD.id,
  primaryAxisGroupByFieldMetadataId: STATUS_FIELD.id,
} as BarChartConfiguration;

const buildDrilldownQueryParams = (configuration: BarChartConfiguration) =>
  buildChartDrilldownQueryParams({
    objectMetadataItem,
    configuration,
    clickedData: { primaryBucketRawValue: 'WON' },
    viewId: 'view-1',
    timezone: 'Europe/Paris',
    firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
  });

describe('buildChartDrilldownQueryParams', () => {
  it('turns the clicked bucket into a filter without any chart filter', () => {
    const queryParams = buildDrilldownQueryParams(BASE_CONFIGURATION);

    expect(queryParams.get('filter[status][IS]')).toBe('["WON"]');
    expect(queryParams.get('viewId')).toBe('view-1');
    expect(queryParams.has('filter[createdAt][IS_RELATIVE]')).toBe(false);
  });

  it('carries the dashboard filters merged into the configuration next to the clicked bucket', () => {
    const queryParams = buildDrilldownQueryParams({
      ...BASE_CONFIGURATION,
      filter: appendRecordFiltersToChartFilter({
        chartFilter: BASE_CONFIGURATION.filter,
        recordFilters: [dashboardDateRecordFilter],
      }),
    });

    expect(queryParams.get('filter[createdAt][IS_RELATIVE]')).toBe(
      'PAST_7_DAY',
    );
    expect(queryParams.get('filter[status][IS]')).toBe('["WON"]');
  });

  it('keeps a root-level dashboard filter when the chart uses an advanced filter group', () => {
    const chartFilter = {
      recordFilters: [
        {
          id: 'chart-amount-filter',
          fieldMetadataId: AMOUNT_FIELD.id,
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '100',
          recordFilterGroupId: 'root-group',
        },
      ],
      recordFilterGroups: [{ id: 'root-group', logicalOperator: 'OR' }],
    };

    const queryParams = buildDrilldownQueryParams({
      ...BASE_CONFIGURATION,
      filter: appendRecordFiltersToChartFilter({
        chartFilter,
        recordFilters: [dashboardDateRecordFilter],
      }),
    });

    expect(queryParams.get('filterGroup[operator]')).toBe('OR');
    expect(queryParams.get('filterGroup[filters][0][field]')).toBe('amount');
    expect(queryParams.get('filter[createdAt][IS_RELATIVE]')).toBe(
      'PAST_7_DAY',
    );
    expect(queryParams.get('filter[status][IS]')).toBe('["WON"]');
  });
});
