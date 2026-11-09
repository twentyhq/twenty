import {
  type ChartFilter,
  RecordFilterGroupLogicalOperator,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

// Ungrouped conditions are ANDed with the whole tree, like those in a root AND group
export const removeTopLevelChartFilterConditionsOnField = ({
  filter,
  fieldMetadataId,
}: {
  filter: ChartFilter | null | undefined;
  fieldMetadataId: string;
}): ChartFilter | null => {
  const recordFilters = filter?.recordFilters ?? [];
  const recordFilterGroups = filter?.recordFilterGroups ?? [];

  const topLevelRecordFilterGroupIds = new Set(
    recordFilterGroups
      .filter(
        ({ parentRecordFilterGroupId, logicalOperator }) =>
          !isDefined(parentRecordFilterGroupId) &&
          logicalOperator === RecordFilterGroupLogicalOperator.AND,
      )
      .map(({ id }) => id),
  );

  const conditionsOnField = recordFilters.filter(
    (recordFilter) => recordFilter.fieldMetadataId === fieldMetadataId,
  );

  const areAllConditionsAtTopLevel = conditionsOnField.every(
    ({ recordFilterGroupId }) =>
      !isDefined(recordFilterGroupId) ||
      topLevelRecordFilterGroupIds.has(recordFilterGroupId),
  );

  if (!isNonEmptyArray(conditionsOnField) || !areAllConditionsAtTopLevel) {
    return null;
  }

  const remainingRecordFilters = recordFilters.filter(
    (recordFilter) => !conditionsOnField.includes(recordFilter),
  );

  const remainingRecordFilterGroups = recordFilterGroups.filter(
    ({ id }) =>
      !topLevelRecordFilterGroupIds.has(id) ||
      remainingRecordFilters.some(
        ({ recordFilterGroupId }) => recordFilterGroupId === id,
      ) ||
      recordFilterGroups.some(
        ({ parentRecordFilterGroupId }) => parentRecordFilterGroupId === id,
      ),
  );

  return {
    ...filter,
    recordFilters: remainingRecordFilters,
    recordFilterGroups: remainingRecordFilterGroups,
  };
};
