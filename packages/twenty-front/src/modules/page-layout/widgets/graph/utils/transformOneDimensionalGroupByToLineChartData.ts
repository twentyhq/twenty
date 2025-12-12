import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { GRAPH_DEFAULT_COLOR } from '@/page-layout/widgets/graph/constants/GraphDefaultColor.constant';
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
import { isDefined } from 'twenty-shared/utils';
import { type LineChartConfiguration } from '~/generated/graphql';

type TransformOneDimensionalGroupByToLineChartDataParams = {
  rawResults: GroupByRawResult[];
  groupByFieldX: FieldMetadataItem;
  aggregateField: FieldMetadataItem;
  configuration: LineChartConfiguration;
  aggregateOperation: string;
  objectMetadataItem: ObjectMetadataItem;
  primaryAxisSubFieldName?: string | null;
};

type TransformOneDimensionalGroupByToLineChartDataResult = {
  series: LineChartSeries[];
  hasTooManyGroups: boolean;
  formattedToRawLookup: Map<string, RawDimensionValue>;
};

export const transformOneDimensionalGroupByToLineChartData = ({
  rawResults,
  groupByFieldX,
  aggregateField,
  configuration,
  aggregateOperation,
  objectMetadataItem,
  primaryAxisSubFieldName,
}: TransformOneDimensionalGroupByToLineChartDataParams): TransformOneDimensionalGroupByToLineChartDataResult => {
  // TODO: Add a limit to the query instead of slicing here (issue: twentyhq/core-team-issues#1600)
  const limitedResults = rawResults.slice(
    0,
    LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_DATA_POINTS,
  );

  const formattedValues = formatPrimaryDimensionValues({
    groupByRawResults: limitedResults,
    primaryAxisGroupByField: groupByFieldX,
    primaryAxisDateGranularity:
      configuration.primaryAxisDateGranularity ?? undefined,
    primaryAxisGroupBySubFieldName: primaryAxisSubFieldName ?? undefined,
  });

  const formattedToRawLookup = buildFormattedToRawLookup(formattedValues);

  const data: LineChartDataPoint[] = limitedResults
    .map((result) => {
      const dimensionValues = result.groupByDimensionValues;

      const rawAggregateValue = result[aggregateOperation];
      if (!isDefined(rawAggregateValue)) {
        return null;
      }

      const xValue = isDefined(dimensionValues?.[0])
        ? formatDimensionValue({
            value: dimensionValues[0],
            fieldMetadata: groupByFieldX,
            dateGranularity:
              configuration.primaryAxisDateGranularity ?? undefined,
            subFieldName: primaryAxisSubFieldName ?? undefined,
          })
        : '';

      const aggregateValue = computeAggregateValueFromGroupByResult({
        rawResult: result,
        aggregateField,
        aggregateOperation:
          configuration.aggregateOperation as unknown as ExtendedAggregateOperations,
        aggregateOperationFromRawResult: aggregateOperation,
        objectMetadataItem,
      });

      return {
        x: xValue,
        y: aggregateValue,
      };
    })
    .filter((point) => isDefined(point));

  const transformedData = configuration.isCumulative
    ? applyCumulativeTransformToLineChartData({
        data,
        rangeMin: configuration.rangeMin ?? undefined,
        rangeMax: configuration.rangeMax ?? undefined,
      })
    : data;

  const series: LineChartSeries[] = [
    {
      id: aggregateField.name,
      label: aggregateField.label,
      color: (configuration.color ?? GRAPH_DEFAULT_COLOR) as GraphColor,
      data: transformedData,
    },
  ];

  return {
    series,
    hasTooManyGroups:
      rawResults.length > LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_DATA_POINTS,
    formattedToRawLookup,
  };
};
