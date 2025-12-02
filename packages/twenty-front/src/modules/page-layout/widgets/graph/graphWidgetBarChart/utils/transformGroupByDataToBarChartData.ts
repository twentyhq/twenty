import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity.constant';
import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { fillDateGapsInBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/fillDateGapsInBarChartData';
import { transformOneDimensionalGroupByToBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/transformOneDimensionalGroupByToBarChartData';
import { transformTwoDimensionalGroupByToBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/transformTwoDimensionalGroupByToBarChartData';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { filterGroupByResults } from '@/page-layout/widgets/graph/utils/filterGroupByResults';
import { getFieldKey } from '@/page-layout/widgets/graph/utils/getFieldKey';
import { type BarDatum } from '@nivo/bar';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';
import { GraphType } from '~/generated-metadata/graphql';
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
  data: BarDatum[];
  indexBy: string;
  keys: string[];
  series: BarChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showDataLabels: boolean;
  showLegend: boolean;
  layout?: BarChartLayout;
  hasTooManyGroups: boolean;
  formattedToRawLookup: Map<string, RawDimensionValue>;
};

const EMPTY_BAR_CHART_RESULT: TransformGroupByDataToBarChartDataResult = {
  data: [],
  indexBy: '',
  keys: [],
  series: [],
  xAxisLabel: undefined,
  yAxisLabel: undefined,
  showDataLabels: false,
  showLegend: true,
  layout: BarChartLayout.VERTICAL,
  hasTooManyGroups: false,
  formattedToRawLookup: new Map(),
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
    return {
      ...EMPTY_BAR_CHART_RESULT,
      layout:
        configuration.graphType === GraphType.HORIZONTAL_BAR
          ? BarChartLayout.HORIZONTAL
          : BarChartLayout.VERTICAL,
    };
  }

  const primaryAxisSubFieldName =
    configuration.primaryAxisGroupBySubFieldName ?? undefined;

  const indexByKey = getFieldKey({
    field: groupByFieldX,
    subFieldName: primaryAxisSubFieldName,
  });

  const queryResultGqlFieldName =
    getGroupByQueryResultGqlFieldName(objectMetadataItem);
  const rawResults = groupByData[queryResultGqlFieldName];

  if (!isDefined(rawResults) || !Array.isArray(rawResults)) {
    return {
      ...EMPTY_BAR_CHART_RESULT,
      indexBy: indexByKey,
      layout:
        configuration.graphType === GraphType.HORIZONTAL_BAR
          ? BarChartLayout.HORIZONTAL
          : BarChartLayout.VERTICAL,
    };
  }

  const filteredResults = filterGroupByResults({
    rawResults,
    filterOptions: {
      rangeMin: configuration.rangeMin ?? undefined,
      rangeMax: configuration.rangeMax ?? undefined,
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
  const isNestedDateField =
    !isDateField && isDefined(configuration.primaryAxisDateGranularity);
  const shouldApplyDateGapFill = isDateField || isNestedDateField;

  const omitNullValues = configuration.omitNullValues ?? false;

  const dateGapFillResult =
    shouldApplyDateGapFill && !omitNullValues
      ? fillDateGapsInBarChartData({
          data: filteredResults,
          keys: [aggregateField.name],
          dateGranularity:
            configuration.primaryAxisDateGranularity ??
            GRAPH_DEFAULT_DATE_GRANULARITY,
          hasSecondDimension: isDefined(groupByFieldY),
        })
      : { data: filteredResults, wasTruncated: false };

  const filteredResultsWithDateGaps = dateGapFillResult.data;
  const dateRangeWasTruncated = dateGapFillResult.wasTruncated;

  const baseResult = isDefined(groupByFieldY)
    ? transformTwoDimensionalGroupByToBarChartData({
        rawResults: filteredResultsWithDateGaps,
        groupByFieldX,
        groupByFieldY,
        aggregateField,
        configuration,
        aggregateOperation,
        objectMetadataItem,
        primaryAxisSubFieldName,
      })
    : transformOneDimensionalGroupByToBarChartData({
        rawResults: filteredResultsWithDateGaps,
        groupByFieldX,
        aggregateField,
        configuration,
        aggregateOperation,
        objectMetadataItem,
        primaryAxisSubFieldName,
      });

  const layout =
    configuration.graphType === GraphType.HORIZONTAL_BAR
      ? BarChartLayout.HORIZONTAL
      : BarChartLayout.VERTICAL;

  return {
    ...baseResult,
    xAxisLabel,
    yAxisLabel,
    showDataLabels,
    showLegend,
    layout,
    hasTooManyGroups: baseResult.hasTooManyGroups || dateRangeWasTruncated,
    formattedToRawLookup: baseResult.formattedToRawLookup,
  };
};
