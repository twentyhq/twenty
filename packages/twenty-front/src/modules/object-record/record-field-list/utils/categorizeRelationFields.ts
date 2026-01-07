import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectPermissions & { objectMetadataId: string }
>;

type CategorizeRelationFieldsArgs = {
  relationFields: FieldMetadataItem[];
  objectNameSingular: string;
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
  isJunctionRelationsEnabled: boolean;
};

type CategorizedRelationFields = {
  activityTargetFields: FieldMetadataItem[];
  inlineRelationFields: FieldMetadataItem[];
  boxedRelationFields: FieldMetadataItem[];
};

export const isActivityTargetField = (
  fieldName: string,
  objectNameSingular: string,
): boolean =>
  (objectNameSingular === CoreObjectNameSingular.Note &&
    fieldName === 'noteTargets') ||
  (objectNameSingular === CoreObjectNameSingular.Task &&
    fieldName === 'taskTargets');

const isActivityTargetRelation = (
  fieldMetadataItem: FieldMetadataItem,
  objectNameSingular: string,
): boolean => isActivityTargetField(fieldMetadataItem.name, objectNameSingular);

const canReadRelationTarget = (
  fieldMetadataItem: FieldMetadataItem,
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId,
): boolean => {
  const canReadRelation =
    isDefined(fieldMetadataItem.relation?.targetObjectMetadata.id) &&
    getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      fieldMetadataItem.relation?.targetObjectMetadata.id,
    ).canReadObjectRecords;

  const canReadMorphRelation = fieldMetadataItem?.morphRelations?.every(
    (morphRelation) =>
      isDefined(morphRelation.targetObjectMetadata.id) &&
      getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        morphRelation.targetObjectMetadata.id,
      ).canReadObjectRecords,
  );

  return canReadRelation || (canReadMorphRelation ?? false);
};

export const categorizeRelationFields = ({
  relationFields,
  objectNameSingular,
  objectPermissionsByObjectMetadataId,
  isJunctionRelationsEnabled,
}: CategorizeRelationFieldsArgs): CategorizedRelationFields => {
  const activityTargetFields: FieldMetadataItem[] = [];
  const inlineRelationFields: FieldMetadataItem[] = [];
  const boxedRelationFields: FieldMetadataItem[] = [];

  for (const field of relationFields) {
    // Activity targets are always rendered with ActivityTargetsInlineCell
    if (isActivityTargetRelation(field, objectNameSingular)) {
      activityTargetFields.push(field);
      continue;
    }

    // Junction relations (when feature enabled) are rendered inline with other fields
    if (isJunctionRelationsEnabled && isJunctionRelationField(field)) {
      inlineRelationFields.push(field);
      continue;
    }

    // Boxed relations need read permission check
    if (canReadRelationTarget(field, objectPermissionsByObjectMetadataId)) {
      boxedRelationFields.push(field);
    }
  }

  return {
    activityTargetFields,
    inlineRelationFields,
    boxedRelationFields,
  };
};
