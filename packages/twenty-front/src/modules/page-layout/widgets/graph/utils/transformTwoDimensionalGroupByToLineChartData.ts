import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMaximumNumberOfDataPoints.constant';
import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { computeAggregateValueFromGroupByResult } from '@/page-layout/widgets/graph/utils/computeAggregateValueFromGroupByResult';
import { formatDimensionValue } from '@/page-layout/widgets/graph/utils/formatDimensionValue';
import { isDefined } from 'twenty-shared/utils';
import { type LineChartConfiguration } from '~/generated/graphql';

type TransformTwoDimensionalGroupByToLineChartDataParams = {
  rawResults: GroupByRawResult[];
  groupByFieldX: FieldMetadataItem;
  groupByFieldY: FieldMetadataItem;
  aggregateField: FieldMetadataItem;
  configuration: LineChartConfiguration;
  aggregateOperation: string;
  objectMetadataItem: ObjectMetadataItem;
  primaryAxisSubFieldName?: string | null;
};

type TransformTwoDimensionalGroupByToLineChartDataResult = {
  series: LineChartSeries[];
  hasTooManyGroups: boolean;
};

export const transformTwoDimensionalGroupByToLineChartData = ({
  rawResults,
  groupByFieldX,
  groupByFieldY,
  aggregateField,
  configuration,
  aggregateOperation,
  objectMetadataItem,
  primaryAxisSubFieldName,
}: TransformTwoDimensionalGroupByToLineChartDataParams): TransformTwoDimensionalGroupByToLineChartDataResult => {
  const seriesMap = new Map<string, LineChartDataPoint[]>();
  const xValues = new Set<string>();
  let hasTooManyGroups = false;

  rawResults.forEach((result) => {
    const dimensionValues = result.groupByDimensionValues;
    if (!isDefined(dimensionValues) || dimensionValues.length < 2) return;

    const rawAggregateValue = result[aggregateOperation];
    if (!isDefined(rawAggregateValue)) return;

    const xValue = formatDimensionValue({
      value: dimensionValues[0],
      fieldMetadata: groupByFieldX,
      dateGranularity: configuration.primaryAxisDateGranularity ?? undefined,
      subFieldName: primaryAxisSubFieldName ?? undefined,
    });

    // TODO: Add a limit to the query instead of checking here (issue: twentyhq/core-team-issues#1600)
    const isNewX = !xValues.has(xValue);

    if (
      isNewX &&
      xValues.size >= LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS
    ) {
      hasTooManyGroups = true;
      return;
    }

    xValues.add(xValue);

    const seriesKey = formatDimensionValue({
      value: dimensionValues[1],
      fieldMetadata: groupByFieldY,
      dateGranularity:
        configuration.secondaryAxisGroupByDateGranularity ?? undefined,
      subFieldName: configuration.secondaryAxisGroupBySubFieldName ?? undefined,
    });

    const aggregateValue = computeAggregateValueFromGroupByResult({
      rawResult: result,
      aggregateField,
      aggregateOperation:
        configuration.aggregateOperation as unknown as ExtendedAggregateOperations,
      aggregateOperationFromRawResult: aggregateOperation,
      objectMetadataItem,
    });

    if (!seriesMap.has(seriesKey)) {
      seriesMap.set(seriesKey, []);
    }

    seriesMap.get(seriesKey)!.push({
      x: xValue,
      y: aggregateValue,
    });
  });

  const series: LineChartSeries[] = Array.from(seriesMap.entries()).map(
    ([seriesKey, dataPoints]) => ({
      id: seriesKey,
      label: seriesKey,
      color: configuration.color as GraphColor,
      data: dataPoints,
    }),
  );

  return {
    series,
    hasTooManyGroups,
  };
};
