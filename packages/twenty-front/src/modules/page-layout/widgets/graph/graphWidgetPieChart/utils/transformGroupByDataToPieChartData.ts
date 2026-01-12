import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartMaximumNumberOfSlices.constant';
import { fillSelectGapsInBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/fillSelectGapsInBarChartData';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { determineGraphColorMode } from '@/page-layout/widgets/graph/utils/determineGraphColorMode';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { determineChartItemColor } from '@/page-layout/widgets/graph/utils/determineChartItemColor';
import { parseGraphColor } from '@/page-layout/widgets/graph/utils/parseGraphColor';
import { processOneDimensionalGroupByResults } from '@/page-layout/widgets/graph/utils/processOneDimensionalGroupByResults';
import { sortChartDataIfNeeded } from '@/page-layout/widgets/graph/utils/sortChartDataIfNeeded';
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
  colorMode: GraphColorMode;
};

const EMPTY_PIE_CHART_RESULT: TransformGroupByDataToPieChartDataResult = {
  data: [],
  showLegend: true,
  hasTooManyGroups: false,
  formattedToRawLookup: new Map(),
  colorMode: 'automaticPalette',
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

  const isSelectField = isFieldMetadataSelectKind(groupByField.type);
  const shouldApplySelectGapFill =
    isSelectField && !configuration.hideEmptyCategory;

  const selectGapFillResult = shouldApplySelectGapFill
    ? fillSelectGapsInBarChartData({
        data: filteredResults,
        selectOptions: groupByField.options,
        aggregateKeys: [aggregateField.name],
        hasSecondDimension: false,
      })
    : { data: filteredResults };

  const resultsWithSelectGaps = selectGapFillResult.data;

  const { processedDataPoints, formattedToRawLookup } =
    processOneDimensionalGroupByResults({
      rawResults: resultsWithSelectGaps,
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
    limitedProcessedDataPoints.map(({ xValue, rawXValue, aggregateValue }) => {
      const rawValueString = isDefined(rawXValue) ? String(rawXValue) : null;

      return {
        id: xValue,
        value: aggregateValue,
        color: determineChartItemColor({
          configurationColor: parseGraphColor(configuration.color),
          selectOptions: isFieldMetadataSelectKind(groupByField.type)
            ? groupByField.options
            : undefined,
          rawValue: rawValueString,
        }),
        rawValue: rawValueString,
      };
    });

  const sortedDataWithRawValues = sortChartDataIfNeeded({
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

  const colorMode = determineGraphColorMode({
    configurationColor: configuration.color,
    selectFieldOptions: isFieldMetadataSelectKind(groupByField.type)
      ? groupByField.options
      : undefined,
  });

  return {
    data,
    showLegend,
    hasTooManyGroups:
      resultsWithSelectGaps.length > PIE_CHART_MAXIMUM_NUMBER_OF_SLICES,
    formattedToRawLookup,
    colorMode,
  };
};
