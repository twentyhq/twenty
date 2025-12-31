import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { fillDateGapsInBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/fillDateGapsInBarChartData';
import { transformOneDimensionalGroupByToBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/transformOneDimensionalGroupByToBarChartData';
import { transformTwoDimensionalGroupByToBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/transformTwoDimensionalGroupByToBarChartData';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { filterGroupByResults } from '@/page-layout/widgets/graph/utils/filterGroupByResults';
import { getFieldKey } from '@/page-layout/widgets/graph/utils/getFieldKey';
import { isRelationNestedFieldDateKind } from '@/page-layout/widgets/graph/utils/isRelationNestedFieldDateKind';
import { type BarDatum } from '@nivo/bar';
import {
  isDefined,
  isFieldMetadataDateKind,
  type FirstDayOfTheWeek,
} from 'twenty-shared/utils';
import {
  AxisNameDisplay,
  BarChartLayout,
  type BarChartConfiguration,
} from '~/generated/graphql';

type TransformGroupByDataToBarChartDataParams = {
  groupByData: Record<string, GroupByRawResult[]> | null | undefined;
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
  configuration: BarChartConfiguration;
  aggregateOperation: string;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
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

const EMPTY_BAR_CHART_RESULT: Omit<
  TransformGroupByDataToBarChartDataResult,
  'xAxisLabel' | 'yAxisLabel'
> = {
  data: [],
  indexBy: '',
  keys: [],
  series: [],
  showDataLabels: false,
  showLegend: true,
  layout: BarChartLayout.VERTICAL,
  hasTooManyGroups: false,
  formattedToRawLookup: new Map(),
};

export const transformGroupByDataToBarChartData = ({
  groupByData,
  objectMetadataItem,
  objectMetadataItems,
  configuration,
  aggregateOperation,
  userTimezone,
  firstDayOfTheWeek,
}: TransformGroupByDataToBarChartDataParams): TransformGroupByDataToBarChartDataResult => {
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

  const queryResultGqlFieldName =
    getGroupByQueryResultGqlFieldName(objectMetadataItem);
  const rawResults = groupByData?.[queryResultGqlFieldName];
  const hasNoData =
    !isDefined(groupByData) ||
    !isDefined(rawResults) ||
    !Array.isArray(rawResults) ||
    rawResults.length === 0;

  const showXAxis =
    hasNoData ||
    configuration.axisNameDisplay === AxisNameDisplay.X ||
    configuration.axisNameDisplay === AxisNameDisplay.BOTH;

  const showYAxis =
    hasNoData ||
    configuration.axisNameDisplay === AxisNameDisplay.Y ||
    configuration.axisNameDisplay === AxisNameDisplay.BOTH;

  const xAxisLabel =
    showXAxis && isDefined(groupByFieldX) ? groupByFieldX.label : undefined;

  const yAxisLabel =
    showYAxis && isDefined(aggregateField)
      ? `${getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`
      : undefined;

  const layout =
    configuration.layout === BarChartLayout.HORIZONTAL
      ? BarChartLayout.HORIZONTAL
      : BarChartLayout.VERTICAL;

  if (!isDefined(groupByData)) {
    return {
      ...EMPTY_BAR_CHART_RESULT,
      xAxisLabel,
      yAxisLabel,
      layout,
    };
  }

  if (!isDefined(groupByFieldX) || !isDefined(aggregateField)) {
    return {
      ...EMPTY_BAR_CHART_RESULT,
      xAxisLabel,
      yAxisLabel,
      layout,
    };
  }

  const primaryAxisSubFieldName =
    configuration.primaryAxisGroupBySubFieldName ?? undefined;
  const secondaryAxisSubFieldName =
    configuration.secondaryAxisGroupBySubFieldName ?? undefined;

  const indexByKey = getFieldKey({
    field: groupByFieldX,
    subFieldName: primaryAxisSubFieldName,
  });

  if (!isDefined(rawResults) || !Array.isArray(rawResults)) {
    return {
      ...EMPTY_BAR_CHART_RESULT,
      indexBy: indexByKey,
      xAxisLabel,
      yAxisLabel,
      layout,
    };
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
      ? (configuration.primaryAxisDateGranularity ??
        GRAPH_DEFAULT_DATE_GRANULARITY)
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
      ? (configuration.secondaryAxisGroupByDateGranularity ??
        GRAPH_DEFAULT_DATE_GRANULARITY)
      : undefined;

  const sanitizedConfiguration: BarChartConfiguration = {
    ...configuration,
    primaryAxisDateGranularity: primaryAxisDateGranularity ?? undefined,
    secondaryAxisGroupByDateGranularity:
      secondaryAxisDateGranularity ?? undefined,
  };

  const shouldApplyDateGapFill = isDefined(primaryAxisDateGranularity);

  const omitNullValues = configuration.omitNullValues ?? false;

  const dateGapFillResult =
    shouldApplyDateGapFill && !omitNullValues
      ? fillDateGapsInBarChartData({
          data: filteredResults,
          keys: [aggregateField.name],
          dateGranularity:
            primaryAxisDateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY,
          hasSecondDimension: isDefined(groupByFieldY),
          orderBy: configuration.primaryAxisOrderBy,
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
        configuration: sanitizedConfiguration,
        aggregateOperation,
        objectMetadataItem,
        primaryAxisSubFieldName,
        userTimezone,
        firstDayOfTheWeek,
      })
    : transformOneDimensionalGroupByToBarChartData({
        rawResults: filteredResultsWithDateGaps,
        groupByFieldX,
        aggregateField,
        configuration: sanitizedConfiguration,
        aggregateOperation,
        objectMetadataItem,
        primaryAxisSubFieldName,
        userTimezone,
        firstDayOfTheWeek,
      });

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
