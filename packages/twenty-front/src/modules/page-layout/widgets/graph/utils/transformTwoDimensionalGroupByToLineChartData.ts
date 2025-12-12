import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { applyCumulativeTransformToLineChartData } from '@/page-layout/widgets/graph/utils/applyCumulativeTransformToLineChartData';
import { buildFormattedToRawLookup } from '@/page-layout/widgets/graph/utils/buildFormattedToRawLookup';
import { computeAggregateValueFromGroupByResult } from '@/page-layout/widgets/graph/utils/computeAggregateValueFromGroupByResult';
import { formatDimensionValue } from '@/page-layout/widgets/graph/utils/formatDimensionValue';
import { formatPrimaryDimensionValues } from '@/page-layout/widgets/graph/utils/formatPrimaryDimensionValues';
import { sortLineChartSeries } from '@/page-layout/widgets/graph/utils/sortLineChartSeries';
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
  formattedToRawLookup: Map<string, RawDimensionValue>;
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
  const seriesMap = new Map<string, Map<string, number>>();
  const allXValues: string[] = [];
  const xValueSet = new Set<string>();
  const formattedValues = formatPrimaryDimensionValues({
    groupByRawResults: rawResults,
    primaryAxisGroupByField: groupByFieldX,
    primaryAxisDateGranularity:
      configuration.primaryAxisDateGranularity ?? undefined,
    primaryAxisGroupBySubFieldName: primaryAxisSubFieldName ?? undefined,
  });
  const formattedToRawLookup = buildFormattedToRawLookup(formattedValues);
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
    const isNewX = !xValueSet.has(xValue);

    if (
      isNewX &&
      xValueSet.size >= LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_DATA_POINTS
    ) {
      hasTooManyGroups = true;
      return;
    }

    if (isNewX) {
      xValueSet.add(xValue);
      allXValues.push(xValue);
    }

    const seriesRawValue = dimensionValues[1];

    const seriesKey = formatDimensionValue({
      value: seriesRawValue,
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

    if (!isDefined(aggregateValue)) return;

    if (!seriesMap.has(seriesKey)) {
      seriesMap.set(seriesKey, new Map());
    }

    seriesMap.get(seriesKey)!.set(xValue, aggregateValue);
  });

  const unsortedSeries: LineChartSeries[] = Array.from(seriesMap.entries()).map(
    ([seriesKey, xToYMap]) => {
      const data: LineChartDataPoint[] = allXValues.map((xValue) => ({
        x: xValue,
        y: xToYMap.get(xValue) ?? 0,
      }));

      const transformedData = configuration.isCumulative
        ? applyCumulativeTransformToLineChartData({
            data,
            rangeMin: configuration.rangeMin ?? undefined,
            rangeMax: configuration.rangeMax ?? undefined,
          })
        : data;

      return {
        id: seriesKey,
        label: seriesKey,
        color: configuration.color as GraphColor,
        data: transformedData,
      };
    },
  );

  const series = sortLineChartSeries({
    series: unsortedSeries,
    orderByY: configuration.secondaryAxisOrderBy,
  });

  return {
    series,
    hasTooManyGroups,
    formattedToRawLookup,
  };
};
