import { isNonEmptyString } from '@sniptt/guards';

import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMorphRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationOneToMany';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { isNonEmptyArray } from 'twenty-shared/utils';

type IsOneToManyRelationFieldReadOnlyDueToTargetUpdatePermissionParams = {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
};

// Attaching or detaching writes the inverse many-to-one's join column, so its field restriction applies.
const isTargetRecordUpdateBlocked = ({
  objectPermissionsByObjectMetadataId,
  targetObjectMetadataId,
  inverseFieldMetadataId,
}: {
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
  targetObjectMetadataId: string;
  inverseFieldMetadataId: string | undefined;
}): boolean => {
  const targetObjectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    targetObjectMetadataId,
  );

  if (targetObjectPermissions.canUpdateObjectRecords === false) {
    return true;
  }

  return (
    isNonEmptyString(inverseFieldMetadataId) &&
    !getFieldPermissions({
      objectPermissions: targetObjectPermissions,
      fieldMetadataId: inverseFieldMetadataId,
    }).canUpdateField
  );
};

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

    return isTargetRecordUpdateBlocked({
      objectPermissionsByObjectMetadataId,
      targetObjectMetadataId: relationObjectMetadataId,
      inverseFieldMetadataId: fieldDefinition.metadata.relationFieldMetadataId,
    });
  }

  if (isFieldMorphRelationOneToMany(fieldDefinition)) {
    const morphRelations = fieldDefinition.metadata.morphRelations;

    if (!isNonEmptyArray(morphRelations)) {
      return false;
    }

    return morphRelations.every((morphRelation) =>
      isTargetRecordUpdateBlocked({
        objectPermissionsByObjectMetadataId,
        targetObjectMetadataId: morphRelation.targetObjectMetadata.id,
        inverseFieldMetadataId: morphRelation.targetFieldMetadata.id,
      }),
    );
  }

  return false;
};
