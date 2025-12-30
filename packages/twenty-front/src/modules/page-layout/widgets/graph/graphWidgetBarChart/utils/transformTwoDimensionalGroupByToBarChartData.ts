import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { applyCumulativeTransformToTwoDimensionalBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/applyCumulativeTransformToTwoDimensionalBarChartData';
import { buildTwoDimensionalBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/buildTwoDimensionalBarChartData';
import { sortTwoDimensionalBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/sortTwoDimensionalBarChartData';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { getFieldKey } from '@/page-layout/widgets/graph/utils/getFieldKey';
import { processTwoDimensionalGroupByResults } from '@/page-layout/widgets/graph/utils/processTwoDimensionalGroupByResults';
import { type BarDatum } from '@nivo/bar';
import { type FirstDayOfTheWeek } from 'twenty-shared/utils';
import { type BarChartConfiguration } from '~/generated/graphql';

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

  const { unsortedData, yValues, hasTooManyGroups } =
    buildTwoDimensionalBarChartData({
      processedDataPoints,
      indexByKey,
      groupMode: configuration.groupMode,
    });

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
