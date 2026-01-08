import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { GRAPH_DEFAULT_COLOR } from '@/page-layout/widgets/graph/constants/GraphDefaultColor.constant';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartMaximumNumberOfSlices.constant';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { processOneDimensionalGroupByResults } from '@/page-layout/widgets/graph/utils/processOneDimensionalGroupByResults';
import { sortChartData } from '@/page-layout/widgets/graph/utils/sortChartData';
import { type FirstDayOfTheWeek } from 'twenty-shared/types';
import { isDefined, isFieldMetadataSelectKind } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated/graphql';

type TransformGroupByDataToPieChartDataParams = {
  groupByData: Record<string, GroupByRawResult[]> | null | undefined;
  objectMetadataItem: ObjectMetadataItem;
  configuration: PieChartConfiguration;
  aggregateOperation: string;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
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
  userTimezone,
  firstDayOfTheWeek,
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

  const filteredResults = configuration.hideEmptyCategory
    ? rawResults.filter((result) =>
        isDefined(result.groupByDimensionValues?.[0]),
      )
    : rawResults;

  const { processedDataPoints, formattedToRawLookup } =
    processOneDimensionalGroupByResults({
      rawResults: filteredResults,
      groupByFieldX: groupByField,
      aggregateField,
      configuration,
      aggregateOperation,
      objectMetadataItem,
      primaryAxisSubFieldName: configuration.groupBySubFieldName,
      userTimezone,
      firstDayOfTheWeek,
    });

  // TODO: Add a limit to the query instead of slicing here (issue: twentyhq/core-team-issues#1600)
  const limitedProcessedDataPoints = processedDataPoints.slice(
    0,
    PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
  );

  type PieChartDataItemWithRawValue = PieChartDataItem & {
    rawValue: string | null | undefined;
  };

  const unsortedDataWithRawValues: PieChartDataItemWithRawValue[] =
    limitedProcessedDataPoints.map(({ xValue, rawXValue, aggregateValue }) => ({
      id: xValue,
      value: aggregateValue,
      color: (configuration.color ?? GRAPH_DEFAULT_COLOR) as GraphColor,
      rawValue: isDefined(rawXValue) ? String(rawXValue) : null,
    }));

  const sortedDataWithRawValues = sortChartData({
    data: unsortedDataWithRawValues,
    orderBy: configuration.orderBy ?? undefined,
    manualSortOrder: configuration.manualSortOrder ?? undefined,
    formattedToRawLookup,
    getFieldValue: (item) => item.id,
    getNumericValue: (item) => item.value,
    selectFieldOptions: isFieldMetadataSelectKind(groupByField.type)
      ? groupByField.options
      : undefined,
  });

  const data: PieChartDataItem[] = sortedDataWithRawValues.map(
    ({ rawValue: _rawValue, ...item }) => item,
  );

  const showLegend = configuration.displayLegend ?? true;

  return {
    data,
    showLegend,
    hasTooManyGroups:
      filteredResults.length > PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
    formattedToRawLookup,
  };
};
