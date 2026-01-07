import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { GRAPH_DEFAULT_COLOR } from '@/page-layout/widgets/graph/constants/GraphDefaultColor.constant';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { applyCumulativeTransformToBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/applyCumulativeTransformToBarChartData';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { getFieldKey } from '@/page-layout/widgets/graph/utils/getFieldKey';
import { processOneDimensionalGroupByResults } from '@/page-layout/widgets/graph/utils/processOneDimensionalGroupByResults';
import { sortChartData } from '@/page-layout/widgets/graph/utils/sortChartData';
import { type BarDatum } from '@nivo/bar';
import {
  type FirstDayOfTheWeek,
  isFieldMetadataSelectKind,
} from 'twenty-shared/utils';
import { type BarChartConfiguration } from '~/generated/graphql';

type TransformOneDimensionalGroupByToBarChartDataParams = {
  rawResults: GroupByRawResult[];
  groupByFieldX: FieldMetadataItem;
  aggregateField: FieldMetadataItem;
  configuration: BarChartConfiguration;
  aggregateOperation: string;
  objectMetadataItem: ObjectMetadataItem;
  primaryAxisSubFieldName?: string | null;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
};

type TransformOneDimensionalGroupByToBarChartDataResult = {
  data: BarDatum[];
  indexBy: string;
  keys: string[];
  series: BarChartSeries[];
  hasTooManyGroups: boolean;
  formattedToRawLookup: Map<string, RawDimensionValue>;
};

export const transformOneDimensionalGroupByToBarChartData = ({
  rawResults,
  groupByFieldX,
  aggregateField,
  configuration,
  aggregateOperation,
  objectMetadataItem,
  primaryAxisSubFieldName,
  userTimezone,
  firstDayOfTheWeek,
}: TransformOneDimensionalGroupByToBarChartDataParams): TransformOneDimensionalGroupByToBarChartDataResult => {
  const indexByKey = getFieldKey({
    field: groupByFieldX,
    subFieldName: primaryAxisSubFieldName ?? undefined,
  });

  const aggregateValueKey =
    indexByKey === aggregateField.name
      ? `${aggregateField.name}-aggregate`
      : aggregateField.name;

  const { processedDataPoints, formattedToRawLookup } =
    processOneDimensionalGroupByResults({
      rawResults,
      groupByFieldX,
      aggregateField,
      configuration,
      aggregateOperation,
      objectMetadataItem,
      primaryAxisSubFieldName,
      userTimezone,
      firstDayOfTheWeek,
    });

  const unsortedData: BarDatum[] = processedDataPoints.map(
    ({ xValue, aggregateValue }) => ({
      [indexByKey]: xValue,
      [aggregateValueKey]: aggregateValue,
    }),
  );

  const sortedData = sortChartData({
    data: unsortedData,
    orderBy: configuration.primaryAxisOrderBy,
    manualSortOrder: configuration.primaryAxisManualSortOrder,
    formattedToRawLookup,
    getFieldValue: (datum) => datum[indexByKey] as string,
    getNumericValue: (datum) => datum[aggregateValueKey] as number,
    selectFieldOptions: isFieldMetadataSelectKind(groupByFieldX.type)
      ? groupByFieldX.options
      : undefined,
  });

  const limitedSortedData = sortedData.slice(
    0,
    BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS,
  );

  const series: BarChartSeries[] = [
    {
      key: aggregateValueKey,
      label: aggregateField.label,
      color: (configuration.color ?? GRAPH_DEFAULT_COLOR) as GraphColor,
    },
  ];

  const finalData = configuration.isCumulative
    ? applyCumulativeTransformToBarChartData({
        data: limitedSortedData,
        aggregateKey: aggregateValueKey,
        rangeMin: configuration.rangeMin ?? undefined,
        rangeMax: configuration.rangeMax ?? undefined,
      })
    : limitedSortedData;

  return {
    data: finalData,
    indexBy: indexByKey,
    keys: [aggregateValueKey],
    series,
    hasTooManyGroups:
      rawResults.length > BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS,
    formattedToRawLookup,
  };
};
