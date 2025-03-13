import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-shared';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

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
