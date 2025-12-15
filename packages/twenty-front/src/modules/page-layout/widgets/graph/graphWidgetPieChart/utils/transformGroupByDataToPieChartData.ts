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
import { isRelationNestedFieldDateKind } from '@/page-layout/widgets/graph/utils/isRelationNestedFieldDateKind';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated/graphql';

type TransformGroupByDataToPieChartDataParams = {
  groupByData: Record<string, GroupByRawResult[]> | null | undefined;
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
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
  objectMetadataItems,
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

  const isDateField = isFieldMetadataDateKind(groupByField.type);
  const isNestedDateField = isRelationNestedFieldDateKind({
    relationField: groupByField,
    relationNestedFieldName: configuration.groupBySubFieldName ?? undefined,
    objectMetadataItems,
  });

  const dateGranularity: ObjectRecordGroupByDateGranularity | undefined =
    isDateField || isNestedDateField
      ? (configuration.dateGranularity ?? undefined)
      : undefined;

  const filteredResults = configuration.hideEmptyCategory
    ? rawResults.filter((result) =>
        isDefined(result.groupByDimensionValues?.[0]),
      )
    : rawResults;

  // TODO: Add a limit to the query instead of slicing here (issue: twentyhq/core-team-issues#1600)
  const limitedResults = filteredResults.slice(
    0,
    PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
  );

  const formattedValues = formatPrimaryDimensionValues({
    groupByRawResults: limitedResults,
    primaryAxisGroupByField: groupByField,
    primaryAxisDateGranularity: dateGranularity,
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

  return {
    data,
    showLegend,
    hasTooManyGroups:
      filteredResults.length > PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
    formattedToRawLookup,
  };
};
