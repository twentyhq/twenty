import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type View } from '@/views/types/View';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { type RecordFilterValueDependencies } from 'twenty-shared/types';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
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
}) => {
  const recordFilters = mapViewFiltersToFilters(
    view.viewFilters,
    fieldMetadataItems,
  );

  // Incomplete metadata must not turn a filtered view into a match-all view.
  if (recordFilters.length !== view.viewFilters.length) {
    throw new Error('Unable to resolve view filters');
  }

  const filter = computeRecordGqlOperationFilter({
    fieldMetadataItems,
    filterValueDependencies,
    recordFilters,
    recordFilterGroups: mapViewFilterGroupsToRecordFilterGroups(
      view.viewFilterGroups ?? [],
    ),
  });
  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectFields,
      filterValue: view.anyFieldFilterValue ?? '',
    });

  return combineFilters([{ id: { eq: recordId } }, filter, anyFieldFilter]);
};
