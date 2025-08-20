import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';
import { isDefined } from 'twenty-shared/utils';

export const findDuplicateRecordFilterInNonAdvancedRecordFilters = ({
  recordFilters,
  fieldMetadataItemId,
  subFieldName,
}: {
  recordFilters: RecordFilter[];
  fieldMetadataItemId: string;
  subFieldName?: string | null | undefined;
}): RecordFilter | undefined => {
  const duplicateFilterInCurrentRecordFilters = recordFilters
    .filter((recordFilter) => !isDefined(recordFilter.recordFilterGroupId))
    .find(
      (recordFilter) =>
        compareStrictlyExceptForNullAndUndefined(
          recordFilter.fieldMetadataId,
          fieldMetadataItemId,
        ) &&
        compareStrictlyExceptForNullAndUndefined(
          recordFilter.subFieldName,
          subFieldName,
        ),
    );

  return duplicateFilterInCurrentRecordFilters;
};
