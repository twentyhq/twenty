import { type RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { type Field } from '~/generated/graphql';

import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordFilterValueDependencies } from '@/object-record/record-filter/types/RecordFilterValueDependencies';

import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { turnRecordFilterGroupsIntoGqlOperationFilter } from '@/object-record/record-filter/utils/compute-record-gql-operation-filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { turnRecordFilterIntoRecordGqlOperationFilter } from '@/object-record/record-filter/utils/compute-record-gql-operation-filter/turnRecordFilterIntoGqlOperationFilter';
import { isDefined } from 'twenty-shared/utils';

export const computeRecordGqlOperationFilter = ({
  fields,
  filterValueDependencies,
  recordFilters,
  recordFilterGroups,
}: {
  filterValueDependencies: RecordFilterValueDependencies;
  recordFilters: RecordFilter[];
  fields: Pick<Field, 'id' | 'name' | 'type'>[];
  recordFilterGroups: RecordFilterGroup[];
}): RecordGqlOperationFilter => {
  // NEW: detect if there are groups at all
  const hasGroups = recordFilterGroups.length > 0;

  const regularRecordGqlOperationFilter: RecordGqlOperationFilter[] =
    recordFilters
      // MINIMAL FIX:
      // - If there ARE groups, keep the original behavior (exclude rows assigned to a group).
      // - If there are NO groups, include everything (so nothing gets dropped).
      .filter((filter) => !hasGroups || !isDefined(filter.recordFilterGroupId))
      .map((regularFilter) =>
        turnRecordFilterIntoRecordGqlOperationFilter({
          filterValueDependencies,
          recordFilter: regularFilter,
          fieldMetadataItems: fields,
        }),
      )
      .filter(isDefined);

  const outermostFilterGroupId = recordFilterGroups.find(
    (recordFilterGroup) => !recordFilterGroup.parentRecordFilterGroupId,
  )?.id;

  const advancedRecordGqlOperationFilter =
    turnRecordFilterGroupsIntoGqlOperationFilter(
      filterValueDependencies,
      recordFilters,
      fields,
      recordFilterGroups,
      outermostFilterGroupId,
    );

  const recordGqlOperationFilters = [
    ...regularRecordGqlOperationFilter,
    advancedRecordGqlOperationFilter,
  ].filter(isDefined);

  if (recordGqlOperationFilters.length === 0) {
    return {};
  }

  if (recordGqlOperationFilters.length === 1) {
    return recordGqlOperationFilters[0];
  }

  const recordGqlOperationFilter = {
    and: recordGqlOperationFilters,
  };

  return recordGqlOperationFilter;
};
