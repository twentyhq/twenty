import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
} from 'twenty-shared/utils';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectRecordsPermissions
>;

type CategorizeRelationFieldsArgs = {
  relationFields: FieldMetadataItem[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
};

type CategorizedRelationFields = {
  inlineRelationFields: FieldMetadataItem[];
  junctionRelationFields: FieldMetadataItem[];
  boxedRelationFields: FieldMetadataItem[];
};

const canReadRelationTarget = (
  fieldMetadataItem: FieldMetadataItem,
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId,
): boolean => {
  const canReadRelation =
    isDefined(fieldMetadataItem.relation?.targetObjectMetadata.id) &&
    canAccessThroughAllRecordsOrRlsPermission({
      objectRecordsPermissions: getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        fieldMetadataItem.relation?.targetObjectMetadata.id,
      ),
      operationType: 'read',
    });

  const canReadMorphRelation = fieldMetadataItem?.morphRelations?.every(
    (morphRelation) =>
      isDefined(morphRelation.targetObjectMetadata.id) &&
      canAccessThroughAllRecordsOrRlsPermission({
        objectRecordsPermissions: getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          morphRelation.targetObjectMetadata.id,
        ),
        operationType: 'read',
      }),
  );

  return canReadRelation || (canReadMorphRelation ?? false);
};

export const categorizeRelationFields = ({
  relationFields,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: CategorizeRelationFieldsArgs): CategorizedRelationFields => {
  const inlineRelationFields: FieldMetadataItem[] = [];
  const junctionRelationFields: FieldMetadataItem[] = [];
  const boxedRelationFields: FieldMetadataItem[] = [];

  for (const field of relationFields) {
    const junctionConfig = resolveJunctionConfig({
      settings: field.settings,
      relationObjectMetadataId: field.relation?.targetObjectMetadata.id ?? '',
      relationTargetFieldMetadataId: field.relation?.targetFieldMetadata.id,
      sourceObjectMetadataId: field.relation?.sourceObjectMetadata.id,
      objectMetadataItems,
    });

    if (isDefined(junctionConfig)) {
      if (isUsableJunctionConfig(junctionConfig)) {
        inlineRelationFields.push(field);
        junctionRelationFields.push(field);
      }

      continue;
    }

    if (canReadRelationTarget(field, objectPermissionsByObjectMetadataId)) {
      boxedRelationFields.push(field);
    }
  }

  return {
    inlineRelationFields,
    junctionRelationFields,
    boxedRelationFields,
  };
};
