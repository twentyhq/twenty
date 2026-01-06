import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { buildFormattedToRawLookup } from '@/page-layout/widgets/graph/utils/buildFormattedToRawLookup';
import { computeAggregateValueFromGroupByResult } from '@/page-layout/widgets/graph/utils/computeAggregateValueFromGroupByResult';
import { formatDimensionValue } from '@/page-layout/widgets/graph/utils/formatDimensionValue';
import { formatPrimaryDimensionValues } from '@/page-layout/widgets/graph/utils/formatPrimaryDimensionValues';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { type FirstDayOfTheWeek, isDefined } from 'twenty-shared/utils';

type TwoDimensionalChartConfiguration = {
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity | null;
  primaryAxisGroupBySubFieldName?: string | null;
  secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity | null;
  secondaryAxisGroupBySubFieldName?: string | null;
  aggregateOperation: string;
};

type ProcessTwoDimensionalGroupByResultsParams = {
  rawResults: GroupByRawResult[];
  groupByFieldX: FieldMetadataItem;
  groupByFieldY: FieldMetadataItem;
  aggregateField: FieldMetadataItem;
  configuration: TwoDimensionalChartConfiguration;
  aggregateOperation: string;
  objectMetadataItem: ObjectMetadataItem;
  primaryAxisSubFieldName?: string | null;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
};

export type ProcessedTwoDimensionalDataPoint = {
  xValue: string;
  yValue: string;
  rawXValue: RawDimensionValue;
  rawYValue: RawDimensionValue;
  aggregateValue: number;
};

export type ProcessTwoDimensionalGroupByResultsOutput = {
  processedDataPoints: ProcessedTwoDimensionalDataPoint[];
  formattedToRawLookup: Map<string, RawDimensionValue>;
  yFormattedToRawLookup: Map<string, RawDimensionValue>;
};

export const processTwoDimensionalGroupByResults = ({
  rawResults,
  groupByFieldX,
  groupByFieldY,
  aggregateField,
  configuration,
  aggregateOperation,
  objectMetadataItem,
  primaryAxisSubFieldName,
  userTimezone,
  firstDayOfTheWeek,
}: ProcessTwoDimensionalGroupByResultsParams): ProcessTwoDimensionalGroupByResultsOutput => {
  const formattedValues = formatPrimaryDimensionValues({
    groupByRawResults: rawResults,
    primaryAxisGroupByField: groupByFieldX,
    primaryAxisDateGranularity:
      configuration.primaryAxisDateGranularity ?? undefined,
    primaryAxisGroupBySubFieldName: primaryAxisSubFieldName ?? undefined,
    userTimezone,
    firstDayOfTheWeek,
  });

  const formattedToRawLookup = buildFormattedToRawLookup(formattedValues);
  const yFormattedToRawLookup = new Map<string, RawDimensionValue>();
  const processedDataPoints: ProcessedTwoDimensionalDataPoint[] = [];

  for (const result of rawResults) {
    const dimensionValues = result.groupByDimensionValues;

    if (!isDefined(dimensionValues) || dimensionValues.length < 2) {
      continue;
    }

    const rawXValue = dimensionValues[0] as RawDimensionValue;
    const rawYValue = dimensionValues[1] as RawDimensionValue;

    const xValue = formatDimensionValue({
      value: rawXValue,
      fieldMetadata: groupByFieldX,
      dateGranularity: configuration.primaryAxisDateGranularity ?? undefined,
      subFieldName: primaryAxisSubFieldName ?? undefined,
      userTimezone,
      firstDayOfTheWeek,
    });

    const yValue = formatDimensionValue({
      value: rawYValue,
      fieldMetadata: groupByFieldY,
      dateGranularity:
        configuration.secondaryAxisGroupByDateGranularity ?? undefined,
      subFieldName: configuration.secondaryAxisGroupBySubFieldName ?? undefined,
      userTimezone,
      firstDayOfTheWeek,
    });

    if (isDefined(rawXValue)) {
      formattedToRawLookup.set(xValue, rawXValue);
    }

    if (isDefined(rawYValue)) {
      yFormattedToRawLookup.set(yValue, rawYValue);
    }

    const aggregateValue = computeAggregateValueFromGroupByResult({
      rawResult: result,
      aggregateField,
      aggregateOperation:
        configuration.aggregateOperation as unknown as ExtendedAggregateOperations,
      aggregateOperationFromRawResult: aggregateOperation,
      objectMetadataItem,
    });

    if (!isDefined(aggregateValue)) {
      continue;
    }

    processedDataPoints.push({
      xValue,
      yValue,
      rawXValue,
      rawYValue,
      aggregateValue,
    });
  }

  return {
    processedDataPoints,
    formattedToRawLookup,
    yFormattedToRawLookup,
  };
};
