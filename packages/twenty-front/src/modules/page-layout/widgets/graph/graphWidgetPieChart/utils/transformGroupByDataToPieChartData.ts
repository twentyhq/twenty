import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { GRAPH_DEFAULT_COLOR } from '@/page-layout/widgets/graph/constants/GraphDefaultColor.constant';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartMaximumNumberOfSlices.constant';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { buildFormattedToRawLookup } from '@/page-layout/widgets/graph/utils/buildFormattedToRawLookup';
import { computeAggregateValueFromGroupByResult } from '@/page-layout/widgets/graph/utils/computeAggregateValueFromGroupByResult';
import { formatPrimaryDimensionValues } from '@/page-layout/widgets/graph/utils/formatPrimaryDimensionValues';
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
  showLegend: boolean;
  hasTooManyGroups: boolean;
  formattedToRawLookup: Map<string, RawDimensionValue>;
};

const EMPTY_PIE_CHART_RESULT: TransformGroupByDataToPieChartDataResult = {
  data: [],
  showLegend: true,
  hasTooManyGroups: false,
  formattedToRawLookup: new Map(),
};

export const transformGroupByDataToPieChartData = ({
  groupByData,
  objectMetadataItem,
  configuration,
  aggregateOperation,
}: TransformGroupByDataToPieChartDataParams): TransformGroupByDataToPieChartDataResult => {
  console.log('[DEBUG] transformGroupByDataToPieChartData', {
    groupByData,
    objectMetadataItem: objectMetadataItem?.nameSingular,
    configuration,
    aggregateOperation,
  });

  if (!isDefined(groupByData)) {
    console.log('[DEBUG] No groupByData, returning empty');
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
    console.log('[DEBUG] Field not found', { groupByField, aggregateField });
    return EMPTY_PIE_CHART_RESULT;
  }
  console.log('[DEBUG] Fields found', {
    groupByFieldName: groupByField.name,
    aggregateFieldName: aggregateField.name,
  });

  const queryName = getGroupByQueryResultGqlFieldName(objectMetadataItem);
  const rawResults = groupByData[queryName];

  console.log('[DEBUG] Query results', {
    queryName,
    rawResultsLength: rawResults?.length,
    firstResult: rawResults?.[0],
  });

  if (!isDefined(rawResults) || !Array.isArray(rawResults)) {
    console.log('[DEBUG] No rawResults, returning empty');
    return EMPTY_PIE_CHART_RESULT;
  }

  // TODO: Add a limit to the query instead of slicing here (issue: twentyhq/core-team-issues#1600)
  const limitedResults = rawResults.slice(
    0,
    PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
  );

  const formattedValues = formatPrimaryDimensionValues({
    groupByRawResults: limitedResults,
    primaryAxisGroupByField: groupByField,
    primaryAxisDateGranularity: configuration.dateGranularity ?? undefined,
    primaryAxisGroupBySubFieldName:
      configuration.groupBySubFieldName ?? undefined,
  });

  const formattedToRawLookup = buildFormattedToRawLookup(formattedValues);

  const data: PieChartDataItem[] = limitedResults.map((result, index) => {
    const id = formattedValues[index]?.formattedPrimaryDimensionValue ?? '';

    const value = computeAggregateValueFromGroupByResult({
      rawResult: result,
      aggregateField,
      aggregateOperation:
        configuration.aggregateOperation as unknown as ExtendedAggregateOperations,
      aggregateOperationFromRawResult: aggregateOperation,
      objectMetadataItem,
    });

    return {
      id,
      value,
      color: (configuration.color ?? GRAPH_DEFAULT_COLOR) as GraphColor,
    };
  });

  const showLegend = configuration.displayLegend ?? true;

  console.log('[DEBUG] Final pie chart data', {
    dataLength: data.length,
    firstItem: data[0],
    allItemsHaveId: data.every((d) => d.id !== ''),
    allItemsHaveValue: data.every((d) => d.value > 0),
  });

  return {
    data,
    showLegend,
    hasTooManyGroups: rawResults.length > PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
    formattedToRawLookup,
  };
};
