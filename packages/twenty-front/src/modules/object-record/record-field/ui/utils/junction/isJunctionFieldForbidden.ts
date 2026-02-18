import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { isJunctionTargetForbidden } from '@/object-record/record-field/ui/utils/junction/isJunctionTargetForbidden';
import { type ObjectPermissions } from 'twenty-shared/types';

type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectPermissions & { objectMetadataId: string }
>;

export const isJunctionFieldForbidden = ({
  fieldMetadataItem,
  sourceObjectMetadataId,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: {
  fieldMetadataItem: FieldMetadataItem;
  sourceObjectMetadataId: string;
  objectMetadataItems: ObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
}): boolean => {
  if (!isJunctionRelationField(fieldMetadataItem)) {
    return false;
  }

  const junctionObjectMetadataId =
    fieldMetadataItem.relation?.targetObjectMetadata.id;

  if (!junctionObjectMetadataId) {
    return false;
  }

  const junctionPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    junctionObjectMetadataId,
  );

  if (!junctionPermissions.canReadObjectRecords) {
    return true;
  }

  return isJunctionTargetForbidden({
    settings: fieldMetadataItem.settings,
    junctionObjectMetadataId,
    sourceObjectMetadataId,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
  });
};
