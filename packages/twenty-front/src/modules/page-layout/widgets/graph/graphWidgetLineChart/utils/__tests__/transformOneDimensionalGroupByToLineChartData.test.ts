import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { transformOneDimensionalGroupByToLineChartData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/transformOneDimensionalGroupByToLineChartData';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  AggregateOperations,
  FieldMetadataType,
  WidgetConfigurationType,
  type LineChartConfiguration,
} from '~/generated-metadata/graphql';

describe('transformOneDimensionalGroupByToLineChartData', () => {
  const userTimezone = 'Europe/Paris';

  const mockAggregateField: FieldMetadataItem = {
    id: 'amount-field',
    name: 'amount',
    label: 'Amount',
    type: FieldMetadataType.NUMBER,
  } as FieldMetadataItem;

  const mockGroupByFieldX: FieldMetadataItem = {
    id: 'stage-field',
    name: 'stage',
    label: 'Stage',
    type: FieldMetadataType.TEXT,
  } as FieldMetadataItem;

  const mockDateGroupByField: FieldMetadataItem = {
    id: 'created-at-field',
    name: 'createdAt',
    label: 'Created At',
    type: FieldMetadataType.DATE_TIME,
  } as FieldMetadataItem;

  const mockObjectMetadataItem = {
    id: 'opportunity-object',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    fields: [mockAggregateField, mockGroupByFieldX, mockDateGroupByField],
  } as ObjectMetadataItem;

  const buildConfiguration = (
    overrides: Partial<LineChartConfiguration> = {},
  ): LineChartConfiguration =>
    ({
      __typename: 'LineChartConfiguration',
      configurationType: WidgetConfigurationType.LINE_CHART,
      aggregateFieldMetadataId: 'amount-field',
      aggregateOperation: AggregateOperations.SUM,
      primaryAxisGroupByFieldMetadataId: 'stage-field',
      color: 'blue',
      ...overrides,
    }) as LineChartConfiguration;

  describe('Categorical X-axis', () => {
    it('should transform simple categorical groupBy results', () => {
      const rawResults: GroupByRawResult[] = [
        {
          groupByDimensionValues: ['Qualification'],
          sumAmount: 150000,
        },
        {
          groupByDimensionValues: ['Proposal'],
          sumAmount: 280000,
        },
        {
          groupByDimensionValues: ['Closed Won'],
          sumAmount: 450000,
        },
      ];

      const result = transformOneDimensionalGroupByToLineChartData({
        rawResults,
        groupByFieldX: mockGroupByFieldX,
        aggregateField: mockAggregateField,
        configuration: buildConfiguration(),
        aggregateOperation: 'sumAmount',
        objectMetadataItem: mockObjectMetadataItem,
        primaryAxisSubFieldName: null,
        userTimezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      });

      expect(result.series).toHaveLength(1);
      expect(result.series[0]).toMatchObject({
        id: 'amount',
        label: 'Amount',
        color: 'blue',
      });
      expect(result.series[0].data).toEqual([
        { x: 'Qualification', y: 150000 },
        { x: 'Proposal', y: 280000 },
        { x: 'Closed Won', y: 450000 },
      ]);
      expect(result.hasTooManyGroups).toBe(false);
    });

    it('should treat null aggregate values as zero', () => {
      const rawResults: GroupByRawResult[] = [
        {
          groupByDimensionValues: ['Stage A'],
          sumAmount: 100,
        },
        {
          groupByDimensionValues: ['Stage B'],
          sumAmount: null,
        },
        {
          groupByDimensionValues: ['Stage C'],
          sumAmount: 200,
        },
      ];

      const result = transformOneDimensionalGroupByToLineChartData({
        rawResults,
        groupByFieldX: mockGroupByFieldX,
        aggregateField: mockAggregateField,
        configuration: buildConfiguration(),
        aggregateOperation: 'sumAmount',
        objectMetadataItem: mockObjectMetadataItem,
        primaryAxisSubFieldName: null,
        userTimezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      });

      expect(result.series[0].data).toEqual([
        { x: 'Stage A', y: 100 },
        { x: 'Stage B', y: 0 },
        { x: 'Stage C', y: 200 },
      ]);
      expect(result.hasTooManyGroups).toBe(false);
    });
  });

  describe('Time-series X-axis', () => {
    it('should transform date-based groupBy results', () => {
      const rawResults: GroupByRawResult[] = [
        {
          groupByDimensionValues: ['2024-01-01'],
          sumAmount: 50000,
        },
        {
          groupByDimensionValues: ['2024-02-01'],
          sumAmount: 75000,
        },
        {
          groupByDimensionValues: ['2024-03-01'],
          sumAmount: 60000,
        },
      ];

      const result = transformOneDimensionalGroupByToLineChartData({
        rawResults,
        groupByFieldX: mockDateGroupByField,
        aggregateField: mockAggregateField,
        configuration: buildConfiguration({
          primaryAxisGroupByFieldMetadataId: 'created-at-field',
          primaryAxisDateGranularity: 'MONTH' as any,
        }),
        aggregateOperation: 'sumAmount',
        objectMetadataItem: mockObjectMetadataItem,
        primaryAxisSubFieldName: null,
        userTimezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      });

      expect(result.series).toHaveLength(1);
      expect(result.series[0].data).toHaveLength(3);
      expect(result.series[0].data[0]).toHaveProperty('x');
      expect(result.series[0].data[0]).toHaveProperty('y', 50000);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty results', () => {
      const result = transformOneDimensionalGroupByToLineChartData({
        rawResults: [],
        groupByFieldX: mockGroupByFieldX,
        aggregateField: mockAggregateField,
        configuration: buildConfiguration(),
        aggregateOperation: 'sumAmount',
        objectMetadataItem: mockObjectMetadataItem,
        primaryAxisSubFieldName: null,
        userTimezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      });

      expect(result.series).toHaveLength(1);
      expect(result.series[0].data).toEqual([]);
      expect(result.hasTooManyGroups).toBe(false);
    });

    it('should use default color when not specified', () => {
      const result = transformOneDimensionalGroupByToLineChartData({
        rawResults: [
          {
            groupByDimensionValues: ['Test'],
            sumAmount: 100,
          },
        ],
        groupByFieldX: mockGroupByFieldX,
        aggregateField: mockAggregateField,
        configuration: buildConfiguration({ color: undefined }),
        aggregateOperation: 'sumAmount',
        objectMetadataItem: mockObjectMetadataItem,
        primaryAxisSubFieldName: null,
        userTimezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      });

      expect(result.series[0].color).toBeDefined();
      expect(result.hasTooManyGroups).toBe(false);
    });

    it('should handle COUNT operation', () => {
      const rawResults: GroupByRawResult[] = [
        {
          groupByDimensionValues: ['Stage A'],
          _count: 5,
        },
        {
          groupByDimensionValues: ['Stage B'],
          _count: 10,
        },
      ];

      const result = transformOneDimensionalGroupByToLineChartData({
        rawResults,
        groupByFieldX: mockGroupByFieldX,
        aggregateField: mockAggregateField,
        configuration: buildConfiguration({
          aggregateOperation: AggregateOperations.COUNT,
        }),
        aggregateOperation: '_count',
        objectMetadataItem: mockObjectMetadataItem,
        primaryAxisSubFieldName: null,
        userTimezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      });

      expect(result.series[0].data).toEqual([
        { x: 'Stage A', y: 5 },
        { x: 'Stage B', y: 10 },
      ]);
      expect(result.hasTooManyGroups).toBe(false);
    });
  });
});
