import { isNonEmptyString } from '@sniptt/guards';

import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMorphRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationOneToMany';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectPermissions & { objectMetadataId: string }
>;

type IsOneToManyRelationFieldReadOnlyDueToTargetUpdatePermissionParams = {
  fieldDefinition: FieldDefinition<FieldMetadata>;
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
};

// Attaching or detaching writes the join column owned by the inverse many-to-one
// field, so a field-level restriction there blocks the edit too.
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
    targetObjectPermissions.restrictedFields[inverseFieldMetadataId]
      ?.canUpdate === false
  );
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
