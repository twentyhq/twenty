import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';

export const isAttachmentTargetFieldDefined = ({
  objectNameSingular,
  attachmentFields,
}: {
  objectNameSingular: string;
  attachmentFields: FieldMetadataItem[];
}): boolean => {
  const attachmentTargetFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: objectNameSingular,
  });

  return attachmentFields.some((field) => {
    if (!field.isActive) {
      return false;
    }

    const joinColumnName =
      field.settings && 'joinColumnName' in field.settings
        ? field.settings.joinColumnName
        : undefined;

    if (joinColumnName === attachmentTargetFieldIdName) {
      return true;
    }

    return (
      getForeignKeyNameFromRelationFieldName(field.name) ===
      attachmentTargetFieldIdName
    );
  });
};
