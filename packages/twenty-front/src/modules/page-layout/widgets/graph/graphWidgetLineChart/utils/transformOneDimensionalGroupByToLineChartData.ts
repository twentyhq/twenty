import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { GRAPH_DEFAULT_COLOR } from '@/page-layout/widgets/graph/constants/GraphDefaultColor.constant';
import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { applyCumulativeTransformToLineChartData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/applyCumulativeTransformToLineChartData';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { determineGraphColorMode } from '@/page-layout/widgets/graph/utils/determineGraphColorMode';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { parseGraphColor } from '@/page-layout/widgets/graph/utils/parseGraphColor';
import { processOneDimensionalGroupByResults } from '@/page-layout/widgets/graph/utils/processOneDimensionalGroupByResults';
import { sortChartDataIfNeeded } from '@/page-layout/widgets/graph/utils/sortChartDataIfNeeded';
import {
  isFieldMetadataSelectKind,
  type FirstDayOfTheWeek,
} from 'twenty-shared/utils';
import { type LineChartConfiguration } from '~/generated/graphql';

type TransformOneDimensionalGroupByToLineChartDataParams = {
  rawResults: GroupByRawResult[];
  groupByFieldX: FieldMetadataItem;
  aggregateField: FieldMetadataItem;
  configuration: LineChartConfiguration;
  aggregateOperation: string;
  objectMetadataItem: ObjectMetadataItem;
  primaryAxisSubFieldName?: string | null;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
};

type TransformOneDimensionalGroupByToLineChartDataResult = {
  series: LineChartSeries[];
  hasTooManyGroups: boolean;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  colorMode: GraphColorMode;
};

export const transformOneDimensionalGroupByToLineChartData = ({
  rawResults,
  groupByFieldX,
  aggregateField,
  configuration,
  aggregateOperation,
  objectMetadataItem,
  primaryAxisSubFieldName,
  userTimezone,
  firstDayOfTheWeek,
}: TransformOneDimensionalGroupByToLineChartDataParams): TransformOneDimensionalGroupByToLineChartDataResult => {
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

  const unsortedData: LineChartDataPoint[] = processedDataPoints.map(
    ({ xValue, aggregateValue }) => ({
      x: xValue,
      y: aggregateValue,
    }),
  );

  const sortedData = sortChartDataIfNeeded({
    data: unsortedData,
    orderBy: configuration.primaryAxisOrderBy,
    manualSortOrder: configuration.primaryAxisManualSortOrder,
    formattedToRawLookup,
    getFieldValue: (point) => String(point.x),
    getNumericValue: (point) => point.y ?? 0,
    selectFieldOptions: isFieldMetadataSelectKind(groupByFieldX.type)
      ? groupByFieldX.options
      : undefined,
  });

  const limitedSortedData = sortedData.slice(
    0,
    LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_DATA_POINTS,
  );

  const transformedData = configuration.isCumulative
    ? applyCumulativeTransformToLineChartData({
        data: limitedSortedData,
        rangeMin: configuration.rangeMin ?? undefined,
        rangeMax: configuration.rangeMax ?? undefined,
      })
    : limitedSortedData;

  const series: LineChartSeries[] = [
    {
      id: aggregateField.name,
      label: aggregateField.label,
      color: parseGraphColor(configuration.color) ?? GRAPH_DEFAULT_COLOR,
      data: transformedData,
    },
  ];

  const colorMode = determineGraphColorMode({
    configurationColor: configuration.color,
    selectFieldOptions: isFieldMetadataSelectKind(groupByFieldX.type)
      ? groupByFieldX.options
      : undefined,
  });

  return {
    series,
    hasTooManyGroups:
      rawResults.length > LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_DATA_POINTS,
    formattedToRawLookup,
    colorMode,
  };
};
