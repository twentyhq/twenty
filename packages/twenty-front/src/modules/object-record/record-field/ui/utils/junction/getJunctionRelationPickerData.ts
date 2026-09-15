import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/junction/extractTargetRecordsFromJunction';
import { getSearchableObjectMetadataItems } from '@/object-record/record-field/ui/utils/junction/getSearchableObjectMetadataItems';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getJunctionRelationPickerData = ({
  junctionRecords,
  targetFields,
  objectMetadataItems,
}: {
  junctionRecords: ObjectRecord[] | undefined | null;
  targetFields: FieldMetadataItem[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): {
  pickableMorphItems: RecordPickerPickableMorphItem[];
  searchableObjectMetadataItems: EnrichedObjectMetadataItem[];
} => ({
  pickableMorphItems: extractTargetRecordsFromJunction({
    junctionRecords,
    targetFields,
    objectMetadataItems,
  }).map(({ recordId, objectMetadataId }) => ({
    recordId,
    objectMetadataId,
    isSelected: true,
    isMatchingSearchFilter: true,
  })),
  searchableObjectMetadataItems: getSearchableObjectMetadataItems(
    targetFields,
    objectMetadataItems,
  ),
});
