import { isNonEmptyString } from '@sniptt/guards';

import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMorphRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationOneToMany';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectPermissions & { objectMetadataId: string }
>;

type IsOneToManyRelationFieldReadOnlyDueToTargetUpdatePermissionParams = {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
};

// One-to-many edits persist by updating the related (or junction) record, not the
// source row — require canUpdate on that object metadata.
export const isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission = ({
  fieldDefinition,
  objectPermissionsByObjectMetadataId,
}: IsOneToManyRelationFieldReadOnlyDueToTargetUpdatePermissionParams): boolean => {
  if (isFieldRelationOneToMany(fieldDefinition)) {
    const relationObjectMetadataId =
      fieldDefinition.metadata.relationObjectMetadataId;

    if (!isNonEmptyString(relationObjectMetadataId)) {
      return false;
    }

    const relationObjectPermissions = getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      relationObjectMetadataId,
    );

    return relationObjectPermissions.canUpdateObjectRecords === false;
  }

  if (isFieldMorphRelationOneToMany(fieldDefinition)) {
    const morphTargetIds = [
      ...new Set(
        fieldDefinition.metadata.morphRelations.map(
          (relation) => relation.targetObjectMetadata.id,
        ),
      ),
    ];

    if (!isDefined(morphTargetIds[0])) {
      return false;
    }

    return morphTargetIds.every((targetObjectMetadataId) => {
      const targetPermissions = getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        targetObjectMetadataId,
      );

      return targetPermissions.canUpdateObjectRecords === false;
    });
  }

  return false;
};
