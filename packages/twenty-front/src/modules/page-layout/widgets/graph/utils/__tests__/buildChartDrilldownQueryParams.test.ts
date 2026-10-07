import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
import { FirstDayOfTheWeek, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  AggregateOperations,
  type BarChartConfiguration,
  BarChartLayout,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const getFieldByNameOrThrow = (fieldName: string) => {
  const field = companyObjectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Expected the company mock to have a ${fieldName} field`);
  }

  return field;
};

const nameField = getFieldByNameOrThrow('name');
const createdAtField = getFieldByNameOrThrow('createdAt');

// Shaped like a merged dashboard filter bound to the chart's group-by field.
const dashboardNameFilter: RecordFilter = {
  id: 'dashboard-filter-name',
  fieldMetadataId: nameField.id,
  type: 'TEXT',
  operand: ViewFilterOperand.CONTAINS,
  value: 'Acme',
  displayValue: 'Acme',
  label: 'Company name',
};

const dashboardCreatedAtFilter: RecordFilter = {
  id: 'dashboard-filter-date',
  fieldMetadataId: createdAtField.id,
  type: 'DATE_TIME',
  operand: ViewFilterOperand.IS_RELATIVE,
  value: 'THIS_1_MONTH',
  displayValue: 'This month',
  label: 'Date',
};

// The chart utilities tell chart types apart by __typename, as the API returns it.
const buildConfiguration = (
  recordFilters: RecordFilter[],
): BarChartConfiguration => ({
  __typename: 'BarChartConfiguration',
  configurationType: WidgetConfigurationType.BAR_CHART,
  aggregateFieldMetadataId: nameField.id,
  aggregateOperation: AggregateOperations.COUNT,
  primaryAxisGroupByFieldMetadataId: nameField.id,
  layout: BarChartLayout.VERTICAL,
  filter: { recordFilters, recordFilterGroups: [] },
});

describe('buildChartDrilldownQueryParams', () => {
  it('carries the dashboard filters next to the clicked bucket filter', () => {
    const params = buildChartDrilldownQueryParams({
      objectMetadataItem: companyObjectMetadataItem,
      configuration: buildConfiguration([dashboardCreatedAtFilter]),
      clickedData: { primaryBucketRawValue: 'Globex' },
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
    });

    expect(params.get('filter[createdAt][IS_RELATIVE]')).toBe('THIS_1_MONTH');
    expect(params.getAll('filter[name][CONTAINS]')).toEqual(['Globex']);
  });

  it('lets the clicked bucket replace a dashboard filter on the same field and operand', () => {
    const params = buildChartDrilldownQueryParams({
      objectMetadataItem: companyObjectMetadataItem,
      configuration: buildConfiguration([dashboardNameFilter]),
      clickedData: { primaryBucketRawValue: 'Globex' },
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
    });

    expect(params.getAll('filter[name][CONTAINS]')).toEqual(['Globex']);
  });
});
