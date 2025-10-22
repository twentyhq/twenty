import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { computeAggregateValueFromGroupByResult } from '@/page-layout/widgets/graph/utils/computeAggregateValueFromGroupByResult';
import { isDefined } from 'twenty-shared/utils';

export type GroupByResultFilterOptions = {
  rangeMin?: number | null;
  rangeMax?: number | null;
  omitNullValues?: boolean;
};

type FilterGroupByResultsParams = {
  rawResults: GroupByRawResult[];
  filterOptions: GroupByResultFilterOptions;
  aggregateField: FieldMetadataItem;
  aggregateOperation: ExtendedAggregateOperations;
  aggregateOperationFromRawResult: string;
  objectMetadataItem: ObjectMetadataItem;
};

export const filterGroupByResults = ({
  rawResults,
  filterOptions,
  aggregateField,
  aggregateOperation,
  aggregateOperationFromRawResult,
  objectMetadataItem,
}: FilterGroupByResultsParams): GroupByRawResult[] => {
  const { rangeMin, rangeMax, omitNullValues } = filterOptions;

  const hasActiveFilters =
    isDefined(rangeMin) || isDefined(rangeMax) || omitNullValues === true;

  if (!hasActiveFilters) {
    return rawResults;
  }

  return rawResults.filter((result) => {
    const aggregateValue = computeAggregateValueFromGroupByResult({
      rawResult: result,
      aggregateField,
      aggregateOperation,
      aggregateOperationFromRawResult,
      objectMetadataItem,
    });

    if (omitNullValues === true && !isDefined(aggregateValue)) {
      return false;
    }

    if (omitNullValues === true && aggregateValue === 0) {
      return false;
    }

    if (typeof aggregateValue === 'number') {
      if (isDefined(rangeMin) && aggregateValue < rangeMin) {
        return false;
      }

      if (isDefined(rangeMax) && aggregateValue > rangeMax) {
        return false;
      }
    }

    return true;
  });
};
