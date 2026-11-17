import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-shared/utils';

// A lookup column and its relation column filter the same field on different targets
export const findNonAdvancedRecordFilterForColumn = ({
  recordFilters,
  fieldMetadataItemId,
  relationTargetFieldMetadataId,
}: {
  recordFilters: RecordFilter[];
  fieldMetadataItemId: string;
  relationTargetFieldMetadataId: string | undefined;
}) =>
  recordFilters.find(
    (recordFilter) =>
      recordFilter.fieldMetadataId === fieldMetadataItemId &&
      (recordFilter.relationTargetFieldMetadataId ?? undefined) ===
        relationTargetFieldMetadataId &&
      !isDefined(recordFilter.recordFilterGroupId),
  );
