import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type View } from '@/views/types/View';
import { getRecordGroupVisibilityFilters } from '@/views/utils/getRecordGroupVisibilityFilters';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import {
  type RecordFilterValueDependencies,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

export const getRecordViewFilter = ({
  view,
  recordId,
  objectFields,
  fieldMetadataItems,
  filterValueDependencies,
}: {
  view: View;
  recordId: string;
  objectFields: FieldMetadataItem[];
  fieldMetadataItems: FieldMetadataItem[];
  filterValueDependencies: RecordFilterValueDependencies;
}): RecordGqlOperationFilter | null => {
  const recordFilters = mapViewFiltersToFilters(
    view.viewFilters,
    fieldMetadataItems,
  );

  // Incomplete metadata must not turn a filtered view into a match-all view.
  if (recordFilters.length !== view.viewFilters.length) {
    return null;
  }

  const { recordFilters: recordGroupVisibilityFilters, recordGroupGqlFilter } =
    getRecordGroupVisibilityFilters({ view, fieldMetadataItems });

  const filter = computeRecordGqlOperationFilter({
    fieldMetadataItems,
    filterValueDependencies,
    recordFilters: [...recordFilters, ...recordGroupVisibilityFilters],
    recordFilterGroups: mapViewFilterGroupsToRecordFilterGroups(
      view.viewFilterGroups ?? [],
    ),
  });
  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectFields,
      filterValue: view.anyFieldFilterValue ?? '',
    });

  return combineFilters(
    [
      { id: { eq: recordId } },
      filter,
      anyFieldFilter,
      recordGroupGqlFilter,
    ].filter(isDefined),
  );
};
