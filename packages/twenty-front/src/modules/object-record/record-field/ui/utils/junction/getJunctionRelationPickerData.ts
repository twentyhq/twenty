import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/junction/extractTargetRecordsFromJunction';
import { getPermittedJunctionTargetFields } from '@/object-record/record-field/ui/utils/junction/getPermittedJunctionTargetFields';
import { getSearchableObjectMetadataItems } from '@/object-record/record-field/ui/utils/junction/getSearchableObjectMetadataItems';
import { type ValidJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidJunctionConfig';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getJunctionRelationPickerData = ({
  junctionRecords,
  junctionConfig: { junctionObjectMetadata, targetFields },
  objectMetadataItems,
}: {
  junctionRecords: ObjectRecord[] | undefined | null;
  junctionConfig: Pick<
    ValidJunctionConfig,
    'junctionObjectMetadata' | 'targetFields'
  >;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): {
  pickableMorphItems: RecordPickerPickableMorphItem[];
  searchableObjectMetadataItems: EnrichedObjectMetadataItem[];
} => ({
  pickableMorphItems: extractTargetRecordsFromJunction({
    junctionRecords,
    targetFields: getPermittedJunctionTargetFields({
      targetFields,
      permittedFields: junctionObjectMetadata.readableFields,
    }),
    objectMetadataItems,
  }).map(({ recordId, objectMetadataId }) => ({
    recordId,
    objectMetadataId,
    isSelected: true,
    isMatchingSearchFilter: true,
  })),
  searchableObjectMetadataItems: getSearchableObjectMetadataItems(
    getPermittedJunctionTargetFields({
      targetFields,
      permittedFields: junctionObjectMetadata.updatableFields,
    }),
    objectMetadataItems,
  ),
});
