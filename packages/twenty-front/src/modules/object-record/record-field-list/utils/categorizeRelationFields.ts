import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction';
import { isDefined } from 'twenty-shared/utils';

type ObjectPermissionsByObjectMetadataId = Record<
  string,
  { canReadObjectRecords: boolean }
>;

type CategorizeRelationFieldsArgs = {
  relationFields: FieldMetadataItem[];
  objectNameSingular: string;
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
  isJunctionRelationsEnabled: boolean;
};

type CategorizedRelationFields = {
  activityTargetFields: FieldMetadataItem[];
  junctionRelationFields: FieldMetadataItem[];
  boxedRelationFields: FieldMetadataItem[];
};

// Check if field is a hardcoded activity target relation (noteTargets/taskTargets)
const isActivityTargetRelation = (
  fieldMetadataItem: FieldMetadataItem,
  objectNameSingular: string,
): boolean =>
  (objectNameSingular === CoreObjectNameSingular.Note &&
    fieldMetadataItem.name === 'noteTargets') ||
  (objectNameSingular === CoreObjectNameSingular.Task &&
    fieldMetadataItem.name === 'taskTargets');

// Check if user has read permission for the relation's target object(s)
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
  const junctionRelationFields: FieldMetadataItem[] = [];
  const boxedRelationFields: FieldMetadataItem[] = [];

  for (const field of relationFields) {
    // Activity targets are always rendered with ActivityTargetsInlineCell
    if (isActivityTargetRelation(field, objectNameSingular)) {
      activityTargetFields.push(field);
      continue;
    }

    // Junction relations (when feature enabled) are rendered inline
    if (isJunctionRelationsEnabled && isJunctionRelationField(field)) {
      junctionRelationFields.push(field);
      continue;
    }

    // Boxed relations need read permission check
    if (canReadRelationTarget(field, objectPermissionsByObjectMetadataId)) {
      boxedRelationFields.push(field);
    }
  }

  return {
    activityTargetFields,
    junctionRelationFields,
    boxedRelationFields,
  };
};

