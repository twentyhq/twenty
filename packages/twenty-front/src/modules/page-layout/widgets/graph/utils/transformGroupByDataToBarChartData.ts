import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { getGroupByQueryName } from '@/page-layout/utils/getGroupByQueryName';
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
import { GraphType } from '~/generated-metadata/graphql';

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
  layout?: 'vertical' | 'horizontal';
};

const EMPTY_BAR_CHART_RESULT: TransformGroupByDataToBarChartDataResult = {
  data: [],
  indexBy: '',
  keys: [],
  series: [],
  xAxisLabel: undefined,
  yAxisLabel: undefined,
  showDataLabels: false,
  layout: 'vertical',
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
    (field: FieldMetadataItem) => field.id === configuration.primaryAxisGroup,
  );

  const groupByFieldY = isDefined(configuration.secondaryAxisGroup)
    ? objectMetadataItem.fields.find(
        (field: FieldMetadataItem) =>
          field.id === configuration.secondaryAxisGroup,
      )
    : undefined;

  const aggregateField = objectMetadataItem.fields.find(
    (field: FieldMetadataItem) =>
      field.id === configuration.aggregateFieldMetadataId,
  );

  if (!isDefined(groupByFieldX) || !isDefined(aggregateField)) {
    return {
      ...EMPTY_BAR_CHART_RESULT,
      layout:
        configuration.graphType === GraphType.HORIZONTAL_BAR
          ? 'horizontal'
          : 'vertical',
    };
  }

  const groupBySubFieldNameX =
    configuration.primaryAxisSubFieldName ?? undefined;

  const indexByKey = getFieldKey({
    field: groupByFieldX,
    subFieldName: groupBySubFieldNameX,
  });

  const queryName = getGroupByQueryName(objectMetadataItem);
  const rawResults = groupByData[queryName];

  if (!isDefined(rawResults) || !Array.isArray(rawResults)) {
    return {
      ...EMPTY_BAR_CHART_RESULT,
      indexBy: indexByKey,
      layout:
        configuration.graphType === GraphType.HORIZONTAL_BAR
          ? 'horizontal'
          : 'vertical',
    };
  }

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

  const showDataLabels = configuration.displayDataLabel ?? false;

  const baseResult = isDefined(groupByFieldY)
    ? transformTwoDimensionalGroupByToBarChartData({
        rawResults,
        groupByFieldX,
        groupByFieldY,
        aggregateField,
        configuration,
        aggregateOperation,
        objectMetadataItem,
        groupBySubFieldNameX,
      })
    : transformOneDimensionalGroupByToBarChartData({
        rawResults,
        groupByFieldX,
        aggregateField,
        configuration,
        aggregateOperation,
        objectMetadataItem,
        groupBySubFieldNameX,
      });

  const layout =
    configuration.graphType === GraphType.HORIZONTAL_BAR
      ? 'horizontal'
      : 'vertical';

  return {
    ...baseResult,
    xAxisLabel,
    yAxisLabel,
    showDataLabels,
    layout,
  };
};
