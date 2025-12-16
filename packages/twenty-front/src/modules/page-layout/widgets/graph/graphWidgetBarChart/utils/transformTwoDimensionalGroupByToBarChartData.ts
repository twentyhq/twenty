import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { sortBarChartDataBySecondaryDimensionSum } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/sortBarChartDataBySecondaryDimensionSum';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { applyCumulativeTransformToTwoDimensionalBarChartData } from '@/page-layout/widgets/graph/utils/applyCumulativeTransformToTwoDimensionalBarChartData';
import { buildFormattedToRawLookup } from '@/page-layout/widgets/graph/utils/buildFormattedToRawLookup';
import { computeAggregateValueFromGroupByResult } from '@/page-layout/widgets/graph/utils/computeAggregateValueFromGroupByResult';
import { formatDimensionValue } from '@/page-layout/widgets/graph/utils/formatDimensionValue';
import { formatPrimaryDimensionValues } from '@/page-layout/widgets/graph/utils/formatPrimaryDimensionValues';
import { getFieldKey } from '@/page-layout/widgets/graph/utils/getFieldKey';
import { getSortedKeys } from '@/page-layout/widgets/graph/utils/getSortedKeys';
import { sortByManualOrder } from '@/page-layout/widgets/graph/utils/sortByManualOrder';
import { sortBySelectOptionPosition } from '@/page-layout/widgets/graph/utils/sortBySelectOptionPosition';
import { type BarDatum } from '@nivo/bar';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  BarChartGroupMode,
  GraphOrderBy,
  type BarChartConfiguration,
} from '~/generated/graphql';

type TransformTwoDimensionalGroupByToBarChartDataParams = {
  rawResults: GroupByRawResult[];
  groupByFieldX: FieldMetadataItem;
  groupByFieldY: FieldMetadataItem;
  aggregateField: FieldMetadataItem;
  configuration: BarChartConfiguration;
  aggregateOperation: string;
  objectMetadataItem: ObjectMetadataItem;
  primaryAxisSubFieldName?: string | null;
};

type TransformTwoDimensionalGroupByToBarChartDataResult = {
  data: BarDatum[];
  indexBy: string;
  keys: string[];
  series: BarChartSeries[];
  hasTooManyGroups: boolean;
  formattedToRawLookup: Map<string, RawDimensionValue>;
};

export const transformTwoDimensionalGroupByToBarChartData = ({
  rawResults,
  groupByFieldX,
  groupByFieldY,
  aggregateField,
  configuration,
  aggregateOperation,
  objectMetadataItem,
  primaryAxisSubFieldName,
}: TransformTwoDimensionalGroupByToBarChartDataParams): TransformTwoDimensionalGroupByToBarChartDataResult => {
  const indexByKey = getFieldKey({
    field: groupByFieldX,
    subFieldName: primaryAxisSubFieldName ?? undefined,
  });

  const dataMap = new Map<string, BarDatum>();
  const xValues = new Set<string>();
  const yValues = new Set<string>();
  const yFormattedToRawLookup = new Map<string, RawDimensionValue>();
  const formattedValues = formatPrimaryDimensionValues({
    groupByRawResults: rawResults,
    primaryAxisGroupByField: groupByFieldX,
    primaryAxisDateGranularity:
      configuration.primaryAxisDateGranularity ?? undefined,
    primaryAxisGroupBySubFieldName: primaryAxisSubFieldName ?? undefined,
  });
  const formattedToRawLookup = buildFormattedToRawLookup(formattedValues);

  let hasTooManyGroups = false;

  rawResults.forEach((result) => {
    const dimensionValues = result.groupByDimensionValues;
    if (!isDefined(dimensionValues) || dimensionValues.length < 2) return;

    const xValue = formatDimensionValue({
      value: dimensionValues[0],
      fieldMetadata: groupByFieldX,
      dateGranularity: configuration.primaryAxisDateGranularity ?? undefined,
      subFieldName: configuration.primaryAxisGroupBySubFieldName ?? undefined,
    });
    const yValue = formatDimensionValue({
      value: dimensionValues[1],
      fieldMetadata: groupByFieldY,
      dateGranularity:
        configuration.secondaryAxisGroupByDateGranularity ?? undefined,
      subFieldName: configuration.secondaryAxisGroupBySubFieldName ?? undefined,
    });

    if (isDefined(dimensionValues[0])) {
      formattedToRawLookup.set(xValue, dimensionValues[0] as RawDimensionValue);
    }

    if (isDefined(dimensionValues[1])) {
      yFormattedToRawLookup.set(
        yValue,
        dimensionValues[1] as RawDimensionValue,
      );
    }

    // TODO: Add a limit to the query instead of checking here (issue: twentyhq/core-team-issues#1600)
    const isNewX = !xValues.has(xValue);
    const isNewY = !yValues.has(yValue);

    if (configuration.groupMode === BarChartGroupMode.STACKED) {
      if (
        isNewX &&
        xValues.size >= BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS
      ) {
        hasTooManyGroups = true;
        return;
      }
    }

    if (configuration.groupMode === BarChartGroupMode.GROUPED) {
      const totalUniqueDimensions = xValues.size * yValues.size;
      const additionalDimensions =
        (isNewX ? 1 : 0) * yValues.size + (isNewY ? 1 : 0) * xValues.size;

      if (
        totalUniqueDimensions + additionalDimensions >
        BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS
      ) {
        hasTooManyGroups = true;
        return;
      }
    }

    const aggregateValue = computeAggregateValueFromGroupByResult({
      rawResult: result,
      aggregateField,
      aggregateOperation:
        configuration.aggregateOperation as unknown as ExtendedAggregateOperations,
      aggregateOperationFromRawResult: aggregateOperation,
      objectMetadataItem,
    });

    if (!isDefined(aggregateValue)) return;

    xValues.add(xValue);
    yValues.add(yValue);

    if (!dataMap.has(xValue)) {
      dataMap.set(xValue, {
        [indexByKey]: xValue,
      });
    }

    const dataItem = dataMap.get(xValue)!;
    dataItem[yValue] = aggregateValue;
  });

  const isSecondaryAxisSelectField =
    groupByFieldY.type === FieldMetadataType.SELECT ||
    groupByFieldY.type === FieldMetadataType.MULTI_SELECT;

  const keys = getSortedKeys({
    orderByY: configuration.secondaryAxisOrderBy,
    yValues: Array.from(yValues),
    manualSortOrder: configuration.secondaryAxisManualSortOrder,
    formattedToRawLookup: yFormattedToRawLookup,
    selectFieldOptions: isSecondaryAxisSelectField
      ? groupByFieldY.options
      : undefined,
  });

  const series: BarChartSeries[] = keys.map((key) => ({
    key,
    label: key,
    color: configuration.color as GraphColor,
  }));

  const unsortedData = Array.from(dataMap.values());
  let sortedData = unsortedData;

  if (isDefined(configuration.primaryAxisOrderBy)) {
    if (configuration.primaryAxisOrderBy === GraphOrderBy.MANUAL) {
      if (isDefined(configuration.primaryAxisManualSortOrder)) {
        sortedData = sortByManualOrder({
          items: unsortedData,
          manualSortOrder: configuration.primaryAxisManualSortOrder,
          getRawValue: (datum) => {
            const formattedValue = datum[indexByKey] as string;
            const rawValue = formattedToRawLookup.get(formattedValue);

            return isDefined(rawValue) ? String(rawValue) : formattedValue;
          },
        });
      }
    } else if (
      configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_ASC ||
      configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_DESC
    ) {
      sortedData = [...unsortedData].sort((a, b) => {
        const aValue = a[indexByKey] as string;
        const bValue = b[indexByKey] as string;

        return configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_ASC
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    } else if (
      configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_POSITION_ASC ||
      configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_POSITION_DESC
    ) {
      if (
        isDefined(groupByFieldX.options) &&
        groupByFieldX.options.length > 0
      ) {
        sortedData = sortBySelectOptionPosition({
          items: unsortedData,
          options: groupByFieldX.options,
          formattedToRawLookup,
          getFormattedValue: (datum) => datum[indexByKey] as string,
          direction:
            configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_POSITION_ASC
              ? 'ASC'
              : 'DESC',
        });
      }
    } else {
      sortedData = sortBarChartDataBySecondaryDimensionSum({
        data: unsortedData,
        keys,
        orderBy: configuration.primaryAxisOrderBy,
      });
    }
  }

  const finalData = configuration.isCumulative
    ? applyCumulativeTransformToTwoDimensionalBarChartData({
        data: sortedData,
        keys,
        rangeMin: configuration.rangeMin ?? undefined,
        rangeMax: configuration.rangeMax ?? undefined,
      })
    : sortedData;

  return {
    data: finalData,
    indexBy: indexByKey,
    keys,
    series,
    hasTooManyGroups,
    formattedToRawLookup,
  };
};
