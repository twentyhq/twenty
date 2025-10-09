import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { getGroupByQueryName } from '@/page-layout/utils/getGroupByQueryName';
import { GRAPH_MAXIMUM_NUMBER_OF_GROUPS } from '@/page-layout/widgets/graph/constants/GraphMaximumNumberOfGroups.constant';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { getFieldKey } from '@/page-layout/widgets/graph/utils/getFieldKey';
import { transformOneDimensionalGroupByToBarChartData } from '@/page-layout/widgets/graph/utils/transformOneDimensionalGroupByToBarChartData';
import { transformTwoDimensionalGroupByToBarChartData } from '@/page-layout/widgets/graph/utils/transformTwoDimensionalGroupByToBarChartData';
import { isDefined } from 'twenty-shared/utils';
import {
  AxisNameDisplay,
  type BarChartConfiguration,
} from '~/generated/graphql';

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
  xAxisLabel?: string;
  yAxisLabel?: string;
  showDataLabels: boolean;
};

const EMPTY_BAR_CHART_RESULT: TransformGroupByDataToBarChartDataResult = {
  data: [],
  indexBy: '',
  keys: [],
  series: [],
  xAxisLabel: undefined,
  yAxisLabel: undefined,
  showDataLabels: false,
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

  const indexByKey = getFieldKey({
    field: groupByFieldX,
    subFieldName: configuration.groupBySubFieldNameX,
  });

  const queryName = getGroupByQueryName(objectMetadataItem);
  const queryResults = groupByData[queryName];

  if (!isDefined(queryResults) || !Array.isArray(queryResults)) {
    return {
      ...EMPTY_BAR_CHART_RESULT,
      indexBy: indexByKey,
    };
  }

  // TODO: Add a limit to the query instead of slicing here (issue: twentyhq/core-team-issues#1600)
  const rawResults = queryResults.slice(0, GRAPH_MAXIMUM_NUMBER_OF_GROUPS);

  const showXAxis =
    configuration.axisNameDisplay === AxisNameDisplay.X ||
    configuration.axisNameDisplay === AxisNameDisplay.BOTH;

  const showYAxis =
    configuration.axisNameDisplay === AxisNameDisplay.Y ||
    configuration.axisNameDisplay === AxisNameDisplay.BOTH;

  const xAxisLabel = showXAxis ? groupByFieldX.label : undefined;

  const yAxisLabel = showYAxis
    ? `${getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`
    : undefined;

  const showDataLabels = configuration.displayDataLabel;

  const baseResult = isDefined(groupByFieldY)
    ? transformTwoDimensionalGroupByToBarChartData({
        rawResults,
        groupByFieldX,
        groupByFieldY,
        aggregateField,
        configuration,
        aggregateOperation,
        objectMetadataItem,
      })
    : transformOneDimensionalGroupByToBarChartData({
        rawResults,
        groupByFieldX,
        aggregateField,
        configuration,
        aggregateOperation,
        objectMetadataItem,
      });

  return {
    ...baseResult,
    xAxisLabel,
    yAxisLabel,
    showDataLabels,
  };
};
