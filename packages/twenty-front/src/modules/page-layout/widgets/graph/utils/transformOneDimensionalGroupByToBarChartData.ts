import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { GRAPH_DEFAULT_COLOR } from '@/page-layout/widgets/graph/constants/GraphDefaultColor.constant';
import { BAR_CHART_MAXIMUM_NUMBER_OF_BARS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMaximumNumberOfBars.constant';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { computeAggregateValueFromGroupByResult } from '@/page-layout/widgets/graph/utils/computeAggregateValueFromGroupByResult';
import { formatDimensionValue } from '@/page-layout/widgets/graph/utils/formatDimensionValue';
import { getFieldKey } from '@/page-layout/widgets/graph/utils/getFieldKey';
import { isDefined } from 'twenty-shared/utils';
import { type BarChartConfiguration } from '~/generated/graphql';

type TransformOneDimensionalGroupByToBarChartDataParams = {
  rawResults: GroupByRawResult[];
  groupByFieldX: FieldMetadataItem;
  aggregateField: FieldMetadataItem;
  configuration: BarChartConfiguration;
  aggregateOperation: string;
  objectMetadataItem: ObjectMetadataItem;
  primaryAxisSubFieldName?: string | null;
};

type TransformOneDimensionalGroupByToBarChartDataResult = {
  data: BarChartDataItem[];
  indexBy: string;
  keys: string[];
  series: BarChartSeries[];
  hasTooManyGroups: boolean;
};

export const transformOneDimensionalGroupByToBarChartData = ({
  rawResults,
  groupByFieldX,
  aggregateField,
  configuration,
  aggregateOperation,
  objectMetadataItem,
  primaryAxisSubFieldName,
}: TransformOneDimensionalGroupByToBarChartDataParams): TransformOneDimensionalGroupByToBarChartDataResult => {
  const indexByKey = getFieldKey({
    field: groupByFieldX,
    subFieldName: primaryAxisSubFieldName ?? undefined,
  });

  const aggregateValueKey =
    indexByKey === aggregateField.name
      ? `${aggregateField.name}-aggregate`
      : aggregateField.name;

  // TODO: Add a limit to the query instead of slicing here (issue: twentyhq/core-team-issues#1600)
  const limitedResults = rawResults.slice(0, BAR_CHART_MAXIMUM_NUMBER_OF_BARS);

  const data: BarChartDataItem[] = limitedResults.map((result) => {
    const dimensionValues = result.groupByDimensionValues;

    const xValue = isDefined(dimensionValues?.[0])
      ? formatDimensionValue({
          value: dimensionValues[0],
          fieldMetadata: groupByFieldX,
          dateGranularity:
            configuration.primaryAxisDateGranularity ?? undefined,
          subFieldName:
            configuration.primaryAxisGroupBySubFieldName ?? undefined,
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
      [indexByKey]: xValue,
      [aggregateValueKey]: aggregateValue,
    };
  });

  const series: BarChartSeries[] = [
    {
      key: aggregateValueKey,
      label: aggregateField.label,
      color: (configuration.color ?? GRAPH_DEFAULT_COLOR) as GraphColor,
    },
  ];

  return {
    data,
    indexBy: indexByKey,
    keys: [aggregateValueKey],
    series,
    hasTooManyGroups: rawResults.length > BAR_CHART_MAXIMUM_NUMBER_OF_BARS,
  };
};
