import { buildChartDrilldownQueryParams } from '@/page-layout/widgets/graph/utils/buildChartDrilldownQueryParams';
import { FirstDayOfTheWeek, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  AggregateOperations,
  BarChartLayout,
  type BarChartConfiguration,
  ObjectRecordGroupByDateGranularity,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const closeDateField = opportunityObjectMetadataItem.fields.find(
  ({ name }) => name === 'closeDate',
);

const idField = opportunityObjectMetadataItem.fields.find(
  ({ name }) => name === 'id',
);

if (!isDefined(closeDateField) || !isDefined(idField)) {
  throw new Error('Opportunity mock is missing closeDate or id');
}

const configuration: BarChartConfiguration = {
  __typename: 'BarChartConfiguration',
  configurationType: WidgetConfigurationType.BAR_CHART,
  aggregateFieldMetadataId: idField.id,
  aggregateOperation: AggregateOperations.COUNT,
  layout: BarChartLayout.VERTICAL,
  primaryAxisGroupByFieldMetadataId: closeDateField.id,
  primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
};

describe('buildChartDrilldownQueryParams', () => {
  it('should list the clicked bucket within the dashboard filter, without URL key collisions', () => {
    const queryParams = buildChartDrilldownQueryParams({
      objectMetadataItem: opportunityObjectMetadataItem,
      configuration,
      clickedData: { primaryBucketRawValue: '2026-02-01' },
      timezone: 'UTC',
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      dashboardRecordFilters: [
        {
          fieldMetadataId: closeDateField.id,
          operand: ViewFilterOperand.IS_AFTER,
          value: '2026-01-15',
        },
      ],
    });

    expect(queryParams.get('filterGroup[operator]')).toBe('AND');
    expect(queryParams.get('filterGroup[filters][0][field]')).toBe('closeDate');
    expect(queryParams.get('filterGroup[filters][0][op]')).toBe(
      ViewFilterOperand.IS_AFTER,
    );
    expect(queryParams.get('filterGroup[filters][0][value]')).toBe(
      '2026-01-15',
    );
    expect(queryParams.getAll('filter[closeDate][IS_AFTER]')).toHaveLength(1);
    expect(queryParams.getAll('filter[closeDate][IS_BEFORE]')).toHaveLength(1);
  });

  it('should keep the previous URL without dashboard filters', () => {
    const queryParams = buildChartDrilldownQueryParams({
      objectMetadataItem: opportunityObjectMetadataItem,
      configuration,
      clickedData: { primaryBucketRawValue: '2026-02-01' },
      timezone: 'UTC',
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      dashboardRecordFilters: [],
    });

    expect(queryParams.has('filterGroup[operator]')).toBe(false);
    expect(queryParams.getAll('filter[closeDate][IS_AFTER]')).toHaveLength(1);
  });

  it("should leave out the chart's own period the dashboard filter replaces", () => {
    const queryParams = buildChartDrilldownQueryParams({
      objectMetadataItem: opportunityObjectMetadataItem,
      configuration: {
        ...configuration,
        filter: {
          recordFilters: [
            {
              id: 'this-quarter',
              fieldMetadataId: closeDateField.id,
              operand: ViewFilterOperand.IS_RELATIVE,
              value: 'THIS_1_QUARTER',
            },
            {
              id: 'in-the-past',
              fieldMetadataId: closeDateField.id,
              operand: ViewFilterOperand.IS_IN_PAST,
              value: '',
            },
          ],
          recordFilterGroups: [],
        },
      },
      clickedData: { primaryBucketRawValue: '2026-02-01' },
      timezone: 'UTC',
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      dashboardRecordFilters: [
        {
          fieldMetadataId: closeDateField.id,
          operand: ViewFilterOperand.IS_AFTER,
          value: '2026-01-15',
        },
      ],
    });

    const filterGroupOperands = [...queryParams.entries()]
      .filter(([key]) => /^filterGroup\[filters\]\[\d+\]\[op\]$/.test(key))
      .map(([, operand]) => operand);

    expect(filterGroupOperands).toEqual([
      ViewFilterOperand.IS_IN_PAST,
      ViewFilterOperand.IS_AFTER,
    ]);
  });
});
