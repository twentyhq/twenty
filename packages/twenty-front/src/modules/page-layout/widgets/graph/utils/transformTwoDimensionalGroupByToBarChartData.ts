import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { GRAPH_MAXIMUM_NUMBER_OF_GROUPS } from '@/page-layout/widgets/graph/constants/GraphMaximumNumberOfGroups.constant';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { computeAggregateValueFromGroupByResult } from '@/page-layout/widgets/graph/utils/computeAggregateValueFromGroupByResult';
import { formatDimensionValue } from '@/page-layout/widgets/graph/utils/formatDimensionValue';
import { getFieldKey } from '@/page-layout/widgets/graph/utils/getFieldKey';
import { getSortedKeys } from '@/page-layout/widgets/graph/utils/getSortedKeys';
import { isDefined } from 'twenty-shared/utils';
import { type BarChartConfiguration } from '~/generated/graphql';

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
  data: BarChartDataItem[];
  indexBy: string;
  keys: string[];
  series: BarChartSeries[];
  hasTooManyGroups: boolean;
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

  const dataMap = new Map<string, BarChartDataItem>();
  const xValues = new Set<string>();
  const yValues = new Set<string>();

  let hasTooManyGroups = false;

  rawResults.forEach((result) => {
    const dimensionValues = result.groupByDimensionValues;
    if (!isDefined(dimensionValues) || dimensionValues.length < 2) return;

    const xValue = formatDimensionValue({
      value: dimensionValues[0],
      fieldMetadata: groupByFieldX,
      subFieldName: configuration.primaryAxisGroupBySubFieldName ?? undefined,
    });
    const yValue = formatDimensionValue({
      value: dimensionValues[1],
      fieldMetadata: groupByFieldY,
      subFieldName: configuration.secondaryAxisGroupBySubFieldName ?? undefined,
    });

    // TODO: Add a limit to the query instead of checking here (issue: twentyhq/core-team-issues#1600)
    const isNewX = !xValues.has(xValue);
    const isNewY = !yValues.has(yValue);
    const totalUniqueDimensions = xValues.size * yValues.size;
    const additionalDimensions =
      (isNewX ? 1 : 0) * yValues.size + (isNewY ? 1 : 0) * xValues.size;

    if (
      totalUniqueDimensions + additionalDimensions >
      GRAPH_MAXIMUM_NUMBER_OF_GROUPS
    ) {
      hasTooManyGroups = true;
      return;
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

  // Sorting needed because yValues may be unordered despite BE orderBy, if there are empty groups
  const keys = getSortedKeys({
    orderByY: configuration.secondaryAxisOrderBy,
    yValues: Array.from(yValues),
  });

  const series: BarChartSeries[] = keys.map((key) => ({
    key,
    label: key,
  }));

  return {
    data: Array.from(dataMap.values()),
    indexBy: indexByKey,
    keys,
    series,
    hasTooManyGroups,
  };
};
