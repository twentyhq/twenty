import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { GRAPH_DEFAULT_COLOR } from '@/page-layout/widgets/graph/constants/GraphDefaultColor.constant';
import { GRAPH_MAXIMUM_NUMBER_OF_GROUPS } from '@/page-layout/widgets/graph/constants/GraphMaximumNumberOfGroups.constant';
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
};

type TransformOneDimensionalGroupByToBarChartDataResult = {
  data: BarChartDataItem[];
  indexBy: string;
  keys: string[];
  series: BarChartSeries[];
};

export const transformOneDimensionalGroupByToBarChartData = ({
  rawResults,
  groupByFieldX,
  aggregateField,
  configuration,
  aggregateOperation,
  objectMetadataItem,
}: TransformOneDimensionalGroupByToBarChartDataParams): TransformOneDimensionalGroupByToBarChartDataResult => {
  const indexByKey = getFieldKey({
    field: groupByFieldX,
    subFieldName: configuration.groupBySubFieldNameX,
  });

  // TODO: Add a limit to the query instead of slicing here (issue: twentyhq/core-team-issues#1600)
  const limitedResults = rawResults.slice(0, GRAPH_MAXIMUM_NUMBER_OF_GROUPS);

  const data: BarChartDataItem[] = limitedResults.map((result) => {
    const dimensionValues = result.groupByDimensionValues;

    const xValue = isDefined(dimensionValues?.[0])
      ? formatDimensionValue({
          value: dimensionValues[0],
          fieldMetadata: groupByFieldX,
          subFieldName: configuration.groupBySubFieldNameX ?? undefined,
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
      [aggregateField.name]: aggregateValue,
    };
  });

  const series: BarChartSeries[] = [
    {
      key: aggregateField.name,
      label: aggregateField.label,
      color: (configuration.color ?? GRAPH_DEFAULT_COLOR) as GraphColor,
    },
  ];

  return {
    data,
    indexBy: indexByKey,
    keys: [aggregateField.name],
    series,
  };
};
