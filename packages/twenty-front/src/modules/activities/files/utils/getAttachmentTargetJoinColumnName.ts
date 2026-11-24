import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getAttachmentTargetJoinColumnName = ({
  attachmentObjectMetadataItem,
  targetObjectNameSingular,
  objectMetadataItems,
}: {
  attachmentObjectMetadataItem: EnrichedObjectMetadataItem;
  targetObjectNameSingular: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): string | undefined => {
  const targetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === targetObjectNameSingular,
  );

  if (!isDefined(targetObjectMetadataItem)) {
    return undefined;
  }

  const attachmentMorphTargetFields =
    attachmentObjectMetadataItem.fields.filter(
      (field) => field.type === FieldMetadataType.MORPH_RELATION,
    );

  return findTargetFieldInfo(
    attachmentMorphTargetFields,
    targetObjectMetadataItem.id,
    objectMetadataItems,
  )?.joinColumnName;
};
