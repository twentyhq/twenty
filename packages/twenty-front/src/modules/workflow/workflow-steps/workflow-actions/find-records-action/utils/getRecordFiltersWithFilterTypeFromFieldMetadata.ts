import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

// Persisted filter types are a denormalized copy that steps written through
// the API can get wrong (e.g. MORPH_RELATION), so derive them from field
// metadata like views do
export const getRecordFiltersWithFilterTypeFromFieldMetadata = ({
  recordFilters,
  fieldMetadataItemByIdMap,
}: {
  recordFilters: RecordFilter[];
  fieldMetadataItemByIdMap: Map<string, FieldMetadataItem>;
}): RecordFilter[] =>
  recordFilters.map((recordFilter) => {
    const filterFieldMetadataItem = fieldMetadataItemByIdMap.get(
      recordFilter.relationTargetFieldMetadataId ??
        recordFilter.fieldMetadataId,
    );

    if (!isDefined(filterFieldMetadataItem)) {
      return recordFilter;
    }

    return {
      ...recordFilter,
      type: getFilterTypeFromFieldType(filterFieldMetadataItem.type),
    };
  });
