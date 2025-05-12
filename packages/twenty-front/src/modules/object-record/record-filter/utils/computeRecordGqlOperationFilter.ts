import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { Field } from '~/generated/graphql';

import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterValueDependencies } from '@/object-record/record-filter/types/RecordFilterValueDependencies';

import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
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
  const regularRecordGqlOperationFilter: RecordGqlOperationFilter[] =
    recordFilters
      .filter((filter) => !isDefined(filter.recordFilterGroupId))
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
