import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { transformTwoDimensionalGroupByToLineChartData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/transformTwoDimensionalGroupByToLineChartData';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  AggregateOperations,
  FieldMetadataType,
  WidgetConfigurationType,
  type LineChartConfiguration,
} from '~/generated-metadata/graphql';

describe('transformTwoDimensionalGroupByToLineChartData', () => {
  const userTimezone = 'Europe/Paris';

  const mockAggregateField: FieldMetadataItem = {
    id: 'amount-field',
    name: 'amount',
    label: 'Amount',
    type: FieldMetadataType.NUMBER,
  } as FieldMetadataItem;

  const mockGroupByFieldX: FieldMetadataItem = {
    id: 'created-at-field',
    name: 'createdAt',
    label: 'Created At',
    type: FieldMetadataType.DATE_TIME,
  } as FieldMetadataItem;

  const mockGroupByFieldY: FieldMetadataItem = {
    id: 'stage-field',
    name: 'stage',
    label: 'Stage',
    type: FieldMetadataType.TEXT,
  } as FieldMetadataItem;

  const mockObjectMetadataItem = {
    id: 'opportunity-object',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    fields: [mockAggregateField, mockGroupByFieldX, mockGroupByFieldY],
  } as ObjectMetadataItem;

  const buildConfiguration = (
    overrides: Partial<LineChartConfiguration> = {},
  ): LineChartConfiguration =>
    ({
      __typename: 'LineChartConfiguration',
      configurationType: WidgetConfigurationType.LINE_CHART,
      aggregateFieldMetadataId: 'amount-field',
      aggregateOperation: AggregateOperations.SUM,
      primaryAxisGroupByFieldMetadataId: 'created-at-field',
      secondaryAxisGroupByFieldMetadataId: 'stage-field',
      color: 'blue',
      ...overrides,
    }) as LineChartConfiguration;

  describe('Multi-series transformation', () => {
    it('should create multiple series from 2D groupBy results', () => {
      const rawResults: GroupByRawResult[] = [
        {
          groupByDimensionValues: ['2024-01-01', 'Qualification'],
          sumAmount: 50000,
        },
        {
          groupByDimensionValues: ['2024-01-01', 'Proposal'],
          sumAmount: 75000,
        },
        {
          groupByDimensionValues: ['2024-02-01', 'Qualification'],
          sumAmount: 60000,
        },
        {
          groupByDimensionValues: ['2024-02-01', 'Proposal'],
          sumAmount: 90000,
        },
        {
          groupByDimensionValues: ['2024-03-01', 'Qualification'],
          sumAmount: 55000,
        },
        {
          groupByDimensionValues: ['2024-03-01', 'Proposal'],
          sumAmount: 80000,
        },
      ];

      const result = transformTwoDimensionalGroupByToLineChartData({
        rawResults,
        groupByFieldX: mockGroupByFieldX,
        groupByFieldY: mockGroupByFieldY,
        aggregateField: mockAggregateField,
        configuration: buildConfiguration(),
        aggregateOperation: 'sumAmount',
        objectMetadataItem: mockObjectMetadataItem,
        primaryAxisSubFieldName: null,
        userTimezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      });

      expect(result.series).toHaveLength(2);

      expect(result.series[0]).toMatchObject({
        id: expect.any(String),
        label: expect.any(String),
        color: 'blue',
      });

      expect(result.series[0].data).toHaveLength(3);
      expect(result.series[1].data).toHaveLength(3);

      expect(result.series[0].data[0]).toHaveProperty('x');
      expect(result.series[0].data[0]).toHaveProperty('y');

      result.series.forEach((series) => {
        series.data.forEach((point) => {
          expect(point).toHaveProperty('x');
          expect(point).toHaveProperty('y');
        });
      });

      expect(result.hasTooManyGroups).toBe(false);
    });

    it('should preserve backend ordering of data points', () => {
      const rawResults: GroupByRawResult[] = [
        {
          groupByDimensionValues: ['2024-01-01', 'Stage A'],
          sumAmount: 100,
        },
        {
          groupByDimensionValues: ['2024-02-01', 'Stage A'],
          sumAmount: 200,
        },
        {
          groupByDimensionValues: ['2024-03-01', 'Stage A'],
          sumAmount: 300,
        },
      ];

      const result = transformTwoDimensionalGroupByToLineChartData({
        rawResults,
        groupByFieldX: mockGroupByFieldX,
        groupByFieldY: mockGroupByFieldY,
        aggregateField: mockAggregateField,
        configuration: buildConfiguration(),
        aggregateOperation: 'sumAmount',
        objectMetadataItem: mockObjectMetadataItem,
        primaryAxisSubFieldName: null,
        userTimezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      });

      const series = result.series[0];
      expect(series.data[0].y).toBe(100);
      expect(series.data[1].y).toBe(200);
      expect(series.data[2].y).toBe(300);

      expect(result.hasTooManyGroups).toBe(false);
    });

    it('should normalize sparse data (all series share same X values, with 0 for missing)', () => {
      const rawResults: GroupByRawResult[] = [
        {
          groupByDimensionValues: ['2024-01-01', 'Stage A'],
          sumAmount: 100,
        },
        {
          groupByDimensionValues: ['2024-02-01', 'Stage A'],
          sumAmount: 200,
        },
        {
          groupByDimensionValues: ['2024-01-01', 'Stage B'],
          sumAmount: 150,
        },
        {
          groupByDimensionValues: ['2024-03-01', 'Stage B'],
          sumAmount: 250,
        },
      ];

      const result = transformTwoDimensionalGroupByToLineChartData({
        rawResults,
        groupByFieldX: mockGroupByFieldX,
        groupByFieldY: mockGroupByFieldY,
        aggregateField: mockAggregateField,
        configuration: buildConfiguration(),
        aggregateOperation: 'sumAmount',
        objectMetadataItem: mockObjectMetadataItem,
        primaryAxisSubFieldName: null,
        userTimezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      });

      const stageA = result.series.find((s) => s.id === 'Stage A');
      expect(stageA?.data).toHaveLength(3);
      expect(stageA?.data[0].y).toBe(100);
      expect(stageA?.data[1].y).toBe(200);
      expect(stageA?.data[2].y).toBe(0);

      const stageB = result.series.find((s) => s.id === 'Stage B');
      expect(stageB?.data).toHaveLength(3);
      expect(stageB?.data[0].y).toBe(150);
      expect(stageB?.data[1].y).toBe(0);
      expect(stageB?.data[2].y).toBe(250);

      expect(result.hasTooManyGroups).toBe(false);
    });

    it('should convert null aggregate values to zero', () => {
      const rawResults: GroupByRawResult[] = [
        {
          groupByDimensionValues: ['2024-01-01', 'Stage A'],
          sumAmount: 100,
        },
        {
          groupByDimensionValues: ['2024-02-01', 'Stage A'],
          sumAmount: null,
        },
        {
          groupByDimensionValues: ['2024-03-01', 'Stage A'],
          sumAmount: 200,
        },
      ];

      const result = transformTwoDimensionalGroupByToLineChartData({
        rawResults,
        groupByFieldX: mockGroupByFieldX,
        groupByFieldY: mockGroupByFieldY,
        aggregateField: mockAggregateField,
        configuration: buildConfiguration(),
        aggregateOperation: 'sumAmount',
        objectMetadataItem: mockObjectMetadataItem,
        primaryAxisSubFieldName: null,
        userTimezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      });

      expect(result.series[0].data).toHaveLength(3);
      expect(result.series[0].data.map((d) => d.y)).toEqual([100, 0, 200]);

      expect(result.hasTooManyGroups).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty results', () => {
      const result = transformTwoDimensionalGroupByToLineChartData({
        rawResults: [],
        groupByFieldX: mockGroupByFieldX,
        groupByFieldY: mockGroupByFieldY,
        aggregateField: mockAggregateField,
        configuration: buildConfiguration(),
        aggregateOperation: 'sumAmount',
        objectMetadataItem: mockObjectMetadataItem,
        primaryAxisSubFieldName: null,
        userTimezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      });

      expect(result.series).toEqual([]);
      expect(result.hasTooManyGroups).toBe(false);
    });

    it('should skip results with missing dimension values', () => {
      const rawResults: GroupByRawResult[] = [
        {
          groupByDimensionValues: ['2024-01-01'],
          sumAmount: 100,
        },
        {
          groupByDimensionValues: ['2024-02-01', 'Stage A'],
          sumAmount: 200,
        },
      ];

      const result = transformTwoDimensionalGroupByToLineChartData({
        rawResults,
        groupByFieldX: mockGroupByFieldX,
        groupByFieldY: mockGroupByFieldY,
        aggregateField: mockAggregateField,
        configuration: buildConfiguration(),
        aggregateOperation: 'sumAmount',
        objectMetadataItem: mockObjectMetadataItem,
        primaryAxisSubFieldName: null,
        userTimezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      });

      expect(result.series).toHaveLength(1);
      expect(result.series[0].data).toHaveLength(1);

      expect(result.hasTooManyGroups).toBe(false);
    });

    it('should handle COUNT operation', () => {
      const rawResults: GroupByRawResult[] = [
        {
          groupByDimensionValues: ['2024-01-01', 'Stage A'],
          _count: 5,
        },
        {
          groupByDimensionValues: ['2024-02-01', 'Stage A'],
          _count: 10,
        },
      ];

      const result = transformTwoDimensionalGroupByToLineChartData({
        rawResults,
        groupByFieldX: mockGroupByFieldX,
        groupByFieldY: mockGroupByFieldY,
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

      expect(result.series[0].data.map((d) => d.y)).toEqual([5, 10]);

      expect(result.hasTooManyGroups).toBe(false);
    });
  });
});
