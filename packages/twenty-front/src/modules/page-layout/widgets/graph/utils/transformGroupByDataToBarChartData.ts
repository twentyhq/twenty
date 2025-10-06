import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { GRAPH_MAXIMUM_NUMBER_OF_GROUPS } from '@/page-layout/widgets/graph/constants/GraphMaximumNumberOfGroups.constant';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { transformOneDimensionalGroupByToBarChartData } from '@/page-layout/widgets/graph/utils/transformOneDimensionalGroupByToBarChartData';
import { transformTwoDimensionalGroupByToBarChartData } from '@/page-layout/widgets/graph/utils/transformTwoDimensionalGroupByToBarChartData';
import { isDefined } from 'twenty-shared/utils';
import { type BarChartConfiguration } from '~/generated/graphql';
import { getGroupByQueryName } from './getGroupByQueryName';

type TransformGroupByDataToBarChartDataParams = {
  groupByData: Record<string, GroupByRawResult[]> | null | undefined;
  objectMetadataItem: ObjectMetadataItem;
  configuration: BarChartConfiguration;
  aggregateOperation: string;
};

type TransformGroupByDataToBarChartDataResult = {
  data: BarChartDataItem[];
  indexBy: string;
  keys: string[];
  series: BarChartSeries[];
};

const EMPTY_BAR_CHART_RESULT: TransformGroupByDataToBarChartDataResult = {
  data: [],
  indexBy: '',
  keys: [],
  series: [],
};

export const transformGroupByDataToBarChartData = ({
  groupByData,
  objectMetadataItem,
  configuration,
  aggregateOperation,
}: TransformGroupByDataToBarChartDataParams): TransformGroupByDataToBarChartDataResult => {
  if (!isDefined(groupByData)) {
    return EMPTY_BAR_CHART_RESULT;
  }

  const groupByFieldX = objectMetadataItem.fields.find(
    (field: FieldMetadataItem) =>
      field.id === configuration.groupByFieldMetadataIdX,
  );

  const groupByFieldY = objectMetadataItem.fields.find(
    (field: FieldMetadataItem) =>
      field.id === configuration.groupByFieldMetadataIdY,
  );

  const aggregateField = objectMetadataItem.fields.find(
    (field: FieldMetadataItem) =>
      field.id === configuration.aggregateFieldMetadataId,
  );

  if (!isDefined(groupByFieldX) || !isDefined(aggregateField)) {
    return EMPTY_BAR_CHART_RESULT;
  }

  const queryName = getGroupByQueryName(objectMetadataItem);
  const queryResults = groupByData[queryName];

  if (!isDefined(queryResults) || !Array.isArray(queryResults)) {
    return {
      ...EMPTY_BAR_CHART_RESULT,
      indexBy: groupByFieldX.name,
    };
  }

  // TODO: Add a limit to the query instead of slicing here
  const rawResults = queryResults.slice(0, GRAPH_MAXIMUM_NUMBER_OF_GROUPS);

  if (isDefined(groupByFieldY)) {
    return transformTwoDimensionalGroupByToBarChartData({
      rawResults,
      groupByFieldX,
      groupByFieldY,
      aggregateField,
      configuration,
      aggregateOperation,
      objectMetadataItem,
    });
  }

  return transformOneDimensionalGroupByToBarChartData({
    rawResults,
    groupByFieldX,
    aggregateField,
    configuration,
    aggregateOperation,
    objectMetadataItem,
  });
};
