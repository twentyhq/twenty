import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import {
  type JunctionObjectMetadataItem,
  getJunctionConfig,
} from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { type ObjectPermissions, FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectPermissions & { objectMetadataId: string }
>;

export const isJunctionTargetForbidden = ({
  settings,
  junctionObjectMetadataId,
  sourceObjectMetadataId,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: {
  settings: FieldMetadataItem['settings'] | undefined;
  junctionObjectMetadataId: string;
  sourceObjectMetadataId?: string;
  objectMetadataItems: JunctionObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
}): boolean => {
  const junctionConfig = getJunctionConfig({
    settings,
    relationObjectMetadataId: junctionObjectMetadataId,
    sourceObjectMetadataId,
    objectMetadataItems,
  });

  if (!junctionConfig) {
    return false;
  }

  return junctionConfig.targetFields.some((targetField) => {
    if (targetField.type === FieldMetadataType.MORPH_RELATION) {
      const morphRelations = targetField.morphRelations;

      if (!morphRelations || morphRelations.length === 0) {
        return false;
      }

      return morphRelations.every(
        (morphRelation) =>
          isDefined(morphRelation.targetObjectMetadata.id) &&
          !getObjectPermissionsForObject(
            objectPermissionsByObjectMetadataId,
            morphRelation.targetObjectMetadata.id,
          ).canReadObjectRecords,
      );
    }

    const targetObjectMetadataId =
      targetField.relation?.targetObjectMetadata.id;

    if (!targetObjectMetadataId) {
      return false;
    }

    return !getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      targetObjectMetadataId,
    ).canReadObjectRecords;
  });
};
