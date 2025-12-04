import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { filterGroupByResults } from '@/page-layout/widgets/graph/utils/filterGroupByResults';
import { isRelationNestedFieldDateKind } from '@/page-layout/widgets/graph/utils/isRelationNestedFieldDateKind';
import { transformOneDimensionalGroupByToLineChartData } from '@/page-layout/widgets/graph/utils/transformOneDimensionalGroupByToLineChartData';
import { transformTwoDimensionalGroupByToLineChartData } from '@/page-layout/widgets/graph/utils/transformTwoDimensionalGroupByToLineChartData';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';
import {
  AxisNameDisplay,
  type LineChartConfiguration,
} from '~/generated/graphql';

type TransformGroupByDataToLineChartDataParams = {
  groupByData: Record<string, GroupByRawResult[]> | null | undefined;
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
  configuration: LineChartConfiguration;
  aggregateOperation: string;
};

type TransformGroupByDataToLineChartDataResult = {
  series: LineChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showDataLabels: boolean;
  showLegend: boolean;
  hasTooManyGroups: boolean;
  formattedToRawLookup: Map<string, RawDimensionValue>;
};

const EMPTY_LINE_CHART_RESULT: TransformGroupByDataToLineChartDataResult = {
  series: [],
  xAxisLabel: undefined,
  yAxisLabel: undefined,
  showDataLabels: false,
  showLegend: true,
  hasTooManyGroups: false,
  formattedToRawLookup: new Map(),
};

export const transformGroupByDataToLineChartData = ({
  groupByData,
  objectMetadataItem,
  objectMetadataItems,
  configuration,
  aggregateOperation,
}: TransformGroupByDataToLineChartDataParams): TransformGroupByDataToLineChartDataResult => {
  if (!isDefined(groupByData)) {
    return EMPTY_LINE_CHART_RESULT;
  }

  const groupByFieldX = objectMetadataItem.fields.find(
    (field: FieldMetadataItem) =>
      field.id === configuration.primaryAxisGroupByFieldMetadataId,
  );

  const groupByFieldY = isDefined(
    configuration.secondaryAxisGroupByFieldMetadataId,
  )
    ? objectMetadataItem.fields.find(
        (field: FieldMetadataItem) =>
          field.id === configuration.secondaryAxisGroupByFieldMetadataId,
      )
    : undefined;

  const aggregateField = objectMetadataItem.fields.find(
    (field: FieldMetadataItem) =>
      field.id === configuration.aggregateFieldMetadataId,
  );

  if (!isDefined(groupByFieldX) || !isDefined(aggregateField)) {
    return EMPTY_LINE_CHART_RESULT;
  }

  const primaryAxisSubFieldName =
    configuration.primaryAxisGroupBySubFieldName ?? undefined;
  const secondaryAxisSubFieldName =
    configuration.secondaryAxisGroupBySubFieldName ?? undefined;

  const queryResultGqlFieldName =
    getGroupByQueryResultGqlFieldName(objectMetadataItem);
  const rawResults = groupByData[queryResultGqlFieldName];

  if (!isDefined(rawResults) || !Array.isArray(rawResults)) {
    return EMPTY_LINE_CHART_RESULT;
  }

  const filteredResults = filterGroupByResults({
    rawResults,
    filterOptions: {
      rangeMin: configuration.isCumulative
        ? undefined
        : (configuration.rangeMin ?? undefined),
      rangeMax: configuration.isCumulative
        ? undefined
        : (configuration.rangeMax ?? undefined),
      omitNullValues: configuration.omitNullValues ?? false,
    },
    aggregateField,
    aggregateOperation:
      configuration.aggregateOperation as unknown as ExtendedAggregateOperations,
    aggregateOperationFromRawResult: aggregateOperation,
    objectMetadataItem,
  });

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
  const showLegend = configuration.displayLegend ?? true;

  const isDateField = isFieldMetadataDateKind(groupByFieldX.type);
  const isNestedDateField = isRelationNestedFieldDateKind({
    relationField: groupByFieldX,
    relationNestedFieldName: primaryAxisSubFieldName,
    objectMetadataItems,
  });

  const primaryAxisDateGranularity =
    isDateField || isNestedDateField
      ? configuration.primaryAxisDateGranularity
      : undefined;

  const isSecondaryDateField = isDefined(groupByFieldY)
    ? isFieldMetadataDateKind(groupByFieldY.type)
    : false;

  const isSecondaryNestedDateField =
    isDefined(groupByFieldY) &&
    isRelationNestedFieldDateKind({
      relationField: groupByFieldY,
      relationNestedFieldName: secondaryAxisSubFieldName,
      objectMetadataItems,
    });

  const secondaryAxisDateGranularity =
    isSecondaryDateField || isSecondaryNestedDateField
      ? configuration.secondaryAxisGroupByDateGranularity
      : undefined;

  const sanitizedConfiguration: LineChartConfiguration = {
    ...configuration,
    primaryAxisDateGranularity: primaryAxisDateGranularity ?? undefined,
    secondaryAxisGroupByDateGranularity:
      secondaryAxisDateGranularity ?? undefined,
  };

  const baseResult = isDefined(groupByFieldY)
    ? transformTwoDimensionalGroupByToLineChartData({
        rawResults: filteredResults,
        groupByFieldX,
        groupByFieldY,
        aggregateField,
        configuration: sanitizedConfiguration,
        aggregateOperation,
        objectMetadataItem,
        primaryAxisSubFieldName,
      })
    : transformOneDimensionalGroupByToLineChartData({
        rawResults: filteredResults,
        groupByFieldX,
        aggregateField,
        configuration: sanitizedConfiguration,
        aggregateOperation,
        objectMetadataItem,
        primaryAxisSubFieldName,
      });

  return {
    ...baseResult,
    xAxisLabel,
    yAxisLabel,
    showDataLabels,
    showLegend,
    formattedToRawLookup: baseResult.formattedToRawLookup,
  };
};
