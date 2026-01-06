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

type OneDimensionalChartConfiguration = {
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity | null;
  primaryAxisGroupBySubFieldName?: string | null;
  aggregateOperation: string;
};

type ProcessOneDimensionalGroupByResultsParams = {
  rawResults: GroupByRawResult[];
  groupByFieldX: FieldMetadataItem;
  aggregateField: FieldMetadataItem;
  configuration: OneDimensionalChartConfiguration;
  aggregateOperation: string;
  objectMetadataItem: ObjectMetadataItem;
  primaryAxisSubFieldName?: string | null;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
};

export type ProcessedOneDimensionalDataPoint = {
  xValue: string;
  rawXValue: RawDimensionValue;
  aggregateValue: number;
};

export type ProcessOneDimensionalGroupByResultsOutput = {
  processedDataPoints: ProcessedOneDimensionalDataPoint[];
  formattedToRawLookup: Map<string, RawDimensionValue>;
};

export const processOneDimensionalGroupByResults = ({
  rawResults,
  groupByFieldX,
  aggregateField,
  configuration,
  aggregateOperation,
  objectMetadataItem,
  primaryAxisSubFieldName,
  userTimezone,
  firstDayOfTheWeek,
}: ProcessOneDimensionalGroupByResultsParams): ProcessOneDimensionalGroupByResultsOutput => {
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
  const processedDataPoints: ProcessedOneDimensionalDataPoint[] = [];

  for (const result of rawResults) {
    const dimensionValues = result.groupByDimensionValues;

    if (!isDefined(dimensionValues) || dimensionValues.length < 1) {
      continue;
    }

    const rawXValue = dimensionValues[0] as RawDimensionValue;

    const xValue = formatDimensionValue({
      value: rawXValue,
      fieldMetadata: groupByFieldX,
      dateGranularity: configuration.primaryAxisDateGranularity ?? undefined,
      subFieldName: primaryAxisSubFieldName ?? undefined,
      userTimezone,
      firstDayOfTheWeek,
    });

    if (isDefined(rawXValue)) {
      formattedToRawLookup.set(xValue, rawXValue);
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
      rawXValue,
      aggregateValue,
    });
  }

  return {
    processedDataPoints,
    formattedToRawLookup,
  };
};
