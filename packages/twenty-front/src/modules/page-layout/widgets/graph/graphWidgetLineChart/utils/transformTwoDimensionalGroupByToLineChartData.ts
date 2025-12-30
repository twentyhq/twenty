import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { applyCumulativeTransformToLineChartData } from '@/page-layout/widgets/graph/utils/applyCumulativeTransformToLineChartData';
import { processTwoDimensionalGroupByResults } from '@/page-layout/widgets/graph/utils/processTwoDimensionalGroupByResults';
import { sortSecondaryAxisData } from '@/page-layout/widgets/graph/utils/sortSecondaryAxisData';
import { sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually } from '@/page-layout/widgets/graph/utils/sortTwoDimensionalChartPrimaryAxisData';
import {
  isDefined,
  isFieldMetadataSelectKind,
  type FirstDayOfTheWeek,
} from 'twenty-shared/utils';
import { GraphOrderBy, type LineChartConfiguration } from '~/generated/graphql';

type TransformTwoDimensionalGroupByToLineChartDataParams = {
  rawResults: GroupByRawResult[];
  groupByFieldX: FieldMetadataItem;
  groupByFieldY: FieldMetadataItem;
  aggregateField: FieldMetadataItem;
  configuration: LineChartConfiguration;
  aggregateOperation: string;
  objectMetadataItem: ObjectMetadataItem;
  primaryAxisSubFieldName?: string | null;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
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
  userTimezone,
  firstDayOfTheWeek,
}: TransformTwoDimensionalGroupByToLineChartDataParams): TransformTwoDimensionalGroupByToLineChartDataResult => {
  const { processedDataPoints, formattedToRawLookup, yFormattedToRawLookup } =
    processTwoDimensionalGroupByResults({
      rawResults,
      groupByFieldX,
      groupByFieldY,
      aggregateField,
      configuration,
      aggregateOperation,
      objectMetadataItem,
      primaryAxisSubFieldName,
      userTimezone,
      firstDayOfTheWeek,
    });

  const seriesMap = new Map<string, Map<string, number>>();
  const allXValues: string[] = [];
  const xValueSet = new Set<string>();
  let hasTooManyGroups = false;

  // TODO: Add a limit to the query instead of checking here (issue: twentyhq/core-team-issues#1600)
  for (const { xValue, yValue, aggregateValue } of processedDataPoints) {
    const isNewX = !xValueSet.has(xValue);

    if (
      isNewX &&
      xValueSet.size >= LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_DATA_POINTS
    ) {
      hasTooManyGroups = true;
      continue;
    }

    if (isNewX) {
      xValueSet.add(xValue);
      allXValues.push(xValue);
    }

    if (!seriesMap.has(yValue)) {
      seriesMap.set(yValue, new Map());
    }

    seriesMap.get(yValue)!.set(xValue, aggregateValue);
  }

  const sortedXValues =
    isDefined(configuration.primaryAxisOrderBy) &&
    configuration.primaryAxisOrderBy !== GraphOrderBy.VALUE_ASC &&
    configuration.primaryAxisOrderBy !== GraphOrderBy.VALUE_DESC
      ? sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually({
          data: allXValues,
          orderBy: configuration.primaryAxisOrderBy,
          manualSortOrder: configuration.primaryAxisManualSortOrder,
          formattedToRawLookup,
          getFormattedValue: (item) => item,
          selectFieldOptions: groupByFieldX.options,
        })
      : allXValues;

  const unsortedSeries: LineChartSeries[] = Array.from(seriesMap.entries()).map(
    ([seriesKey, xToYMap]) => {
      const data: LineChartDataPoint[] = sortedXValues.map((xValue) => ({
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

  const series = sortSecondaryAxisData({
    items: unsortedSeries,
    orderBy: configuration.secondaryAxisOrderBy,
    manualSortOrder: configuration.secondaryAxisManualSortOrder,
    formattedToRawLookup: yFormattedToRawLookup,
    selectFieldOptions: isFieldMetadataSelectKind(groupByFieldY.type)
      ? groupByFieldY.options
      : undefined,
    getFormattedValue: (item) => item.id,
  });

  return {
    series,
    hasTooManyGroups,
    formattedToRawLookup,
  };
};
