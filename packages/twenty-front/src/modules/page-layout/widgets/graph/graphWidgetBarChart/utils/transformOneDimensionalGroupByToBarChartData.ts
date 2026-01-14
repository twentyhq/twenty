import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { applyCumulativeTransformToBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/applyCumulativeTransformToBarChartData';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { determineGraphColorMode } from '@/page-layout/widgets/graph/utils/determineGraphColorMode';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { determineChartItemColor } from '@/page-layout/widgets/graph/utils/determineChartItemColor';
import { getFieldKey } from '@/page-layout/widgets/graph/utils/getFieldKey';
import { parseGraphColor } from '@/page-layout/widgets/graph/utils/parseGraphColor';
import { processOneDimensionalGroupByResults } from '@/page-layout/widgets/graph/utils/processOneDimensionalGroupByResults';
import { sortChartDataIfNeeded } from '@/page-layout/widgets/graph/utils/sortChartDataIfNeeded';
import { type BarDatum } from '@nivo/bar';
import {
  isDefined,
  isFieldMetadataSelectKind,
  type FirstDayOfTheWeek,
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
  colorMode: GraphColorMode;
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
    ({ xValue, rawXValue, aggregateValue }) => {
      const color = determineChartItemColor({
        configurationColor: parseGraphColor(configuration.color),
        selectOptions: isFieldMetadataSelectKind(groupByFieldX.type)
          ? groupByFieldX.options
          : undefined,
        rawValue: isDefined(rawXValue) ? String(rawXValue) : null,
      });

      return {
        [indexByKey]: xValue,
        [aggregateValueKey]: aggregateValue,
        ...(isDefined(color) && { color }),
      };
    },
  );

  const sortedData = sortChartDataIfNeeded({
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

  const colorMode = determineGraphColorMode({
    configurationColor: configuration.color,
    selectFieldOptions: isFieldMetadataSelectKind(groupByFieldX.type)
      ? groupByFieldX.options
      : undefined,
  });

  return {
    data: finalData,
    indexBy: indexByKey,
    keys: [aggregateValueKey],
    series,
    hasTooManyGroups:
      rawResults.length > BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS,
    formattedToRawLookup,
    colorMode,
  };
};
