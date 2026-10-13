import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getRecordFilterTypeAndLabelFromFieldMetadata } from '@/object-record/record-filter/utils/getRecordFilterTypeAndLabelFromFieldMetadata';

// Persisted record filters carry a denormalized type and label that can be
// stale or wrong (e.g. a raw MORPH_RELATION written through the API), so
// derive them from field metadata like view filters are
export const hydrateRecordFiltersFromFieldMetadata = ({
  recordFilters,
  fieldMetadataItems,
}: {
  recordFilters: RecordFilter[];
  fieldMetadataItems: FieldMetadataItem[];
}): RecordFilter[] =>
  recordFilters.map((recordFilter) => ({
    ...recordFilter,
    ...getRecordFilterTypeAndLabelFromFieldMetadata({
      fieldMetadataId: recordFilter.fieldMetadataId,
      relationTargetFieldMetadataId: recordFilter.relationTargetFieldMetadataId,
      fieldMetadataItems,
    }),
  }));
