import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { sortTwoDimensionalBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/sortTwoDimensionalBarChartData';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { applyCumulativeTransformToTwoDimensionalBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/applyCumulativeTransformToTwoDimensionalBarChartData';
import { getFieldKey } from '@/page-layout/widgets/graph/utils/getFieldKey';
import { processTwoDimensionalGroupByResults } from '@/page-layout/widgets/graph/utils/processTwoDimensionalGroupByResults';
import { type BarDatum } from '@nivo/bar';
import { type FirstDayOfTheWeek } from 'twenty-shared/utils';
import {
  BarChartGroupMode,
  type BarChartConfiguration,
} from '~/generated/graphql';

type TransformTwoDimensionalGroupByToBarChartDataParams = {
  rawResults: GroupByRawResult[];
  groupByFieldX: FieldMetadataItem;
  groupByFieldY: FieldMetadataItem;
  aggregateField: FieldMetadataItem;
  configuration: BarChartConfiguration;
  aggregateOperation: string;
  objectMetadataItem: ObjectMetadataItem;
  primaryAxisSubFieldName?: string | null;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
};

type TransformTwoDimensionalGroupByToBarChartDataResult = {
  data: BarDatum[];
  indexBy: string;
  keys: string[];
  series: BarChartSeries[];
  hasTooManyGroups: boolean;
  formattedToRawLookup: Map<string, RawDimensionValue>;
};

export const transformTwoDimensionalGroupByToBarChartData = ({
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
}: TransformTwoDimensionalGroupByToBarChartDataParams): TransformTwoDimensionalGroupByToBarChartDataResult => {
  const indexByKey = getFieldKey({
    field: groupByFieldX,
    subFieldName: primaryAxisSubFieldName ?? undefined,
  });

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

  const dataMap = new Map<string, BarDatum>();
  const xValues = new Set<string>();
  const yValues = new Set<string>();
  let hasTooManyGroups = false;

  // TODO: Add a limit to the query instead of checking here (issue: twentyhq/core-team-issues#1600)
  for (const { xValue, yValue, aggregateValue } of processedDataPoints) {
    const isNewX = !xValues.has(xValue);
    const isNewY = !yValues.has(yValue);

    if (configuration.groupMode === BarChartGroupMode.STACKED) {
      if (
        isNewX &&
        xValues.size >= BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS
      ) {
        hasTooManyGroups = true;
        continue;
      }
    }

    if (configuration.groupMode === BarChartGroupMode.GROUPED) {
      const totalUniqueDimensions = xValues.size * yValues.size;
      const additionalDimensions =
        (isNewX ? 1 : 0) * yValues.size + (isNewY ? 1 : 0) * xValues.size;

      if (
        totalUniqueDimensions + additionalDimensions >
        BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS
      ) {
        hasTooManyGroups = true;
        continue;
      }
    }

    xValues.add(xValue);
    yValues.add(yValue);

    if (!dataMap.has(xValue)) {
      dataMap.set(xValue, {
        [indexByKey]: xValue,
      });
    }

    const dataItem = dataMap.get(xValue)!;
    dataItem[yValue] = aggregateValue;
  }

  const unsortedData = Array.from(dataMap.values());

  const { sortedData, sortedKeys, sortedSeries } =
    sortTwoDimensionalBarChartData({
      data: unsortedData,
      keys: Array.from(yValues),
      indexByKey,
      configuration,
      primaryAxisFormattedToRawLookup: formattedToRawLookup,
      primaryAxisSelectFieldOptions: groupByFieldX.options,
      secondaryAxisFormattedToRawLookup: yFormattedToRawLookup,
      secondaryAxisSelectFieldOptions: groupByFieldY.options,
    });

  const finalData = configuration.isCumulative
    ? applyCumulativeTransformToTwoDimensionalBarChartData({
        data: sortedData,
        keys: sortedKeys,
        rangeMin: configuration.rangeMin,
        rangeMax: configuration.rangeMax,
      })
    : sortedData;

  return {
    data: finalData,
    indexBy: indexByKey,
    keys: sortedKeys,
    series: sortedSeries,
    hasTooManyGroups,
    formattedToRawLookup,
  };
};
