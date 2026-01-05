import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { applyCumulativeTransformToLineChartData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/applyCumulativeTransformToLineChartData';
import { buildTwoDimensionalLineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/buildTwoDimensionalLineChartSeries';
import { limitTwoDimensionalLineChartData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/limitTwoDimensionalLineChartData';
import { sortTwoDimensionalLineChartData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/sortTwoDimensionalLineChartData';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { processTwoDimensionalGroupByResults } from '@/page-layout/widgets/graph/utils/processTwoDimensionalGroupByResults';
import { type FirstDayOfTheWeek } from 'twenty-shared/utils';
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

  const { unsortedSeries } = buildTwoDimensionalLineChartSeries({
    processedDataPoints,
    color: configuration.color as GraphColor,
  });

  const { sortedSeries } = sortTwoDimensionalLineChartData({
    series: unsortedSeries,
    configuration,
    primaryAxisFormattedToRawLookup: formattedToRawLookup,
    primaryAxisSelectFieldOptions: groupByFieldX.options,
    secondaryAxisFormattedToRawLookup: yFormattedToRawLookup,
    secondaryAxisSelectFieldOptions: groupByFieldY.options,
  });

  const { limitedSeries, hasTooManyGroups } = limitTwoDimensionalLineChartData({
    sortedSeries,
    isStacked:
      configuration.isStacked ?? LINE_CHART_CONSTANTS.IS_STACKED_DEFAULT,
  });

  const finalSeries = configuration.isCumulative
    ? limitedSeries.map((seriesItem) => ({
        ...seriesItem,
        data: applyCumulativeTransformToLineChartData({
          data: seriesItem.data,
          rangeMin: configuration.rangeMin ?? undefined,
          rangeMax: configuration.rangeMax ?? undefined,
        }),
      }))
    : limitedSeries;

  return {
    series: finalSeries,
    hasTooManyGroups,
    formattedToRawLookup,
  };
};
