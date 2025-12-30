import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { sortBarChartDataBySecondaryDimensionSum } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/sortBarChartDataBySecondaryDimensionSum';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { applyCumulativeTransformToTwoDimensionalBarChartData } from '@/page-layout/widgets/graph/utils/applyCumulativeTransformToTwoDimensionalBarChartData';
import { getFieldKey } from '@/page-layout/widgets/graph/utils/getFieldKey';
import { processTwoDimensionalGroupByResults } from '@/page-layout/widgets/graph/utils/processTwoDimensionalGroupByResults';
import { sortSecondaryAxisData } from '@/page-layout/widgets/graph/utils/sortSecondaryAxisData';
import { sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually } from '@/page-layout/widgets/graph/utils/sortTwoDimensionalChartPrimaryAxisData';
import { type BarDatum } from '@nivo/bar';
import {
  isDefined,
  isFieldMetadataSelectKind,
  type FirstDayOfTheWeek,
} from 'twenty-shared/utils';
import {
  BarChartGroupMode,
  GraphOrderBy,
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

  const keys = sortSecondaryAxisData({
    items: Array.from(yValues),
    orderBy: configuration.secondaryAxisOrderBy,
    manualSortOrder: configuration.secondaryAxisManualSortOrder,
    formattedToRawLookup: yFormattedToRawLookup,
    selectFieldOptions: isFieldMetadataSelectKind(groupByFieldY.type)
      ? groupByFieldY.options
      : undefined,
    getFormattedValue: (item) => item,
  });

  const series: BarChartSeries[] = keys.map((key) => ({
    key,
    label: key,
    color: configuration.color as GraphColor,
  }));

  const unsortedData = Array.from(dataMap.values());

  let sortedData: BarDatum[] = unsortedData;

  if (isDefined(configuration.primaryAxisOrderBy)) {
    if (
      configuration.primaryAxisOrderBy === GraphOrderBy.VALUE_ASC ||
      configuration.primaryAxisOrderBy === GraphOrderBy.VALUE_DESC
    ) {
      sortedData = sortBarChartDataBySecondaryDimensionSum({
        data: unsortedData,
        keys,
        orderBy: configuration.primaryAxisOrderBy,
      });
    } else {
      sortedData = sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually({
        data: unsortedData,
        orderBy: configuration.primaryAxisOrderBy,
        manualSortOrder: configuration.primaryAxisManualSortOrder,
        formattedToRawLookup,
        getFormattedValue: (datum) => datum[indexByKey] as string,
        selectFieldOptions: groupByFieldX.options,
      });
    }
  }

  const finalData = configuration.isCumulative
    ? applyCumulativeTransformToTwoDimensionalBarChartData({
        data: sortedData,
        keys,
        rangeMin: configuration.rangeMin ?? undefined,
        rangeMax: configuration.rangeMax ?? undefined,
      })
    : sortedData;

  return {
    data: finalData,
    indexBy: indexByKey,
    keys,
    series,
    hasTooManyGroups,
    formattedToRawLookup,
  };
};
