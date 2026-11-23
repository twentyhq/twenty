import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-shared/utils';

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
