import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import {
  AggregateOperations,
  BarChartLayout,
  GraphOrderBy,
  WidgetConfigurationType,
  type BarChartConfiguration,
} from '~/generated/graphql';
import { transformTwoDimensionalGroupByToBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/transformTwoDimensionalGroupByToBarChartData';

describe('transformTwoDimensionalGroupByToBarChartData', () => {
  const userTimezone = 'Europe/Paris';

  const mockGroupByFieldX = {
    id: 'field-x',
    name: 'createdAt',
    type: FieldMetadataType.DATE,
    label: 'Created At',
  } as FieldMetadataItem;

  const mockGroupByFieldY = {
    id: 'field-y',
    name: 'stage',
    type: FieldMetadataType.SELECT,
    label: 'Stage',
  } as FieldMetadataItem;

  const mockAggregateField = {
    id: 'field-aggregate',
    name: 'amount',
    type: FieldMetadataType.NUMBER,
    label: 'Amount',
  } as FieldMetadataItem;

  const mockObjectMetadataItem = {
    id: 'object-1',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    fields: [mockGroupByFieldX, mockGroupByFieldY, mockAggregateField],
  } as ObjectMetadataItem;

  const mockConfiguration: BarChartConfiguration = {
    __typename: 'BarChartConfiguration',
    configurationType: WidgetConfigurationType.BAR_CHART,
    layout: BarChartLayout.VERTICAL,
    aggregateFieldMetadataId: 'field-aggregate',
    aggregateOperation: AggregateOperations.SUM,
    primaryAxisGroupByFieldMetadataId: 'field-x',
    secondaryAxisGroupByFieldMetadataId: 'field-y',
    secondaryAxisOrderBy: GraphOrderBy.FIELD_DESC,
  };

  it('should order keys correctly despite unordered raw results', () => {
    // This test demonstrates the key ordering issue described in the user query
    // Raw results where "CUSTOMER" appears before "NEW" in the data stream despite orderBy,
    // bc there is no "NEW" group before october 21st and the results are primarily ordered by date ASC
    // but we want them ordered alphabetically-reversed
    const rawResults: GroupByRawResult[] = [
      {
        groupByDimensionValues: ['2025-10-16T00:00:00.000Z', 'SCREENING'],
        sumAmount: 75000000000,
      },
      {
        groupByDimensionValues: ['2025-10-16T00:00:00.000Z', 'PROPOSAL'],
        sumAmount: 380000000000,
      },
      {
        groupByDimensionValues: ['2025-10-17T00:00:00.000Z', 'CUSTOMER'],
        sumAmount: 720000000000,
      },
      {
        groupByDimensionValues: ['2025-10-21T00:00:00.000Z', 'PROPOSAL'],
        sumAmount: 580000000000,
      },
      {
        groupByDimensionValues: ['2025-10-21T00:00:00.000Z', 'NEW'],
        sumAmount: 125000000000,
      },
    ];

    const result = transformTwoDimensionalGroupByToBarChartData({
      rawResults,
      groupByFieldX: mockGroupByFieldX,
      groupByFieldY: mockGroupByFieldY,
      aggregateField: mockAggregateField,
      configuration: mockConfiguration,
      aggregateOperation: 'sumAmount',
      objectMetadataItem: mockObjectMetadataItem,
      userTimezone,
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
    });

    expect(result.keys).toEqual(['SCREENING', 'PROPOSAL', 'NEW', 'CUSTOMER']);
    expect(result.series).toEqual([
      { key: 'SCREENING', label: 'SCREENING' },
      { key: 'PROPOSAL', label: 'PROPOSAL' },
      { key: 'NEW', label: 'NEW' },
      { key: 'CUSTOMER', label: 'CUSTOMER' },
    ]);

    expect(result.data).toHaveLength(3);
    expect(result.data[0]).toEqual({
      createdAt: 'Oct 16, 2025',
      SCREENING: 75000000000,
      PROPOSAL: 380000000000,
    });
    expect(result.data[1]).toEqual({
      createdAt: 'Oct 17, 2025',
      CUSTOMER: 720000000000,
    });
    expect(result.data[2]).toEqual({
      createdAt: 'Oct 21, 2025',
      PROPOSAL: 580000000000,
      NEW: 125000000000,
    });
  });
});
