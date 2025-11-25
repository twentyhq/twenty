import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartMaximumNumberOfSlices.constant';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { computeAggregateValueFromGroupByResult } from '@/page-layout/widgets/graph/utils/computeAggregateValueFromGroupByResult';
import { formatDimensionValue } from '@/page-layout/widgets/graph/utils/formatDimensionValue';
import { isDefined } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated/graphql';

type TransformGroupByDataToPieChartDataParams = {
  groupByData: Record<string, GroupByRawResult[]> | null | undefined;
  objectMetadataItem: ObjectMetadataItem;
  configuration: PieChartConfiguration;
  aggregateOperation: string;
};

type TransformGroupByDataToPieChartDataResult = {
  data: PieChartDataItem[];
  hasTooManyGroups: boolean;
};

const EMPTY_PIE_CHART_RESULT: TransformGroupByDataToPieChartDataResult = {
  data: [],
  hasTooManyGroups: false,
};

export const transformGroupByDataToPieChartData = ({
  groupByData,
  objectMetadataItem,
  configuration,
  aggregateOperation,
}: TransformGroupByDataToPieChartDataParams): TransformGroupByDataToPieChartDataResult => {
  if (!isDefined(groupByData)) {
    return EMPTY_PIE_CHART_RESULT;
  }

  const groupByField = objectMetadataItem.fields.find(
    (field: FieldMetadataItem) =>
      field.id === configuration.groupByFieldMetadataId,
  );

  const aggregateField = objectMetadataItem.fields.find(
    (field: FieldMetadataItem) =>
      field.id === configuration.aggregateFieldMetadataId,
  );

  if (!isDefined(groupByField) || !isDefined(aggregateField)) {
    return EMPTY_PIE_CHART_RESULT;
  }

  const queryName = getGroupByQueryResultGqlFieldName(objectMetadataItem);
  const rawResults = groupByData[queryName];

  if (!isDefined(rawResults) || !Array.isArray(rawResults)) {
    return EMPTY_PIE_CHART_RESULT;
  }

  // TODO: Add a limit to the query instead of slicing here (issue: twentyhq/core-team-issues#1600)
  const limitedResults = rawResults.slice(
    0,
    PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
  );

  const data: PieChartDataItem[] = limitedResults.map((result) => {
    const dimensionValues = result.groupByDimensionValues;

    const label = isDefined(dimensionValues?.[0])
      ? formatDimensionValue({
          value: dimensionValues[0],
          fieldMetadata: groupByField,
          dateGranularity: configuration.dateGranularity ?? undefined,
          subFieldName: configuration.groupBySubFieldName ?? undefined,
        })
      : '';

    const value = computeAggregateValueFromGroupByResult({
      rawResult: result,
      aggregateField,
      aggregateOperation:
        configuration.aggregateOperation as unknown as ExtendedAggregateOperations,
      aggregateOperationFromRawResult: aggregateOperation,
      objectMetadataItem,
    });

    return {
      id: label,
      value: value,
      label: label,
      color: (configuration.color as GraphColor | undefined) ?? undefined,
    };
  });

  return {
    data,
    hasTooManyGroups: rawResults.length > PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
  };
};
