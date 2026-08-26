import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectPermissions & { objectMetadataId: string }
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
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: CategorizeRelationFieldsArgs): CategorizedRelationFields => {
  const inlineRelationFields: FieldMetadataItem[] = [];
  const junctionRelationFields: FieldMetadataItem[] = [];
  const boxedRelationFields: FieldMetadataItem[] = [];

  for (const field of relationFields) {
    const junctionConfig = getJunctionConfig({
      settings: field.settings,
      relationObjectMetadataId: field.relation?.targetObjectMetadata.id ?? '',
      relationTargetFieldMetadataId: field.relation?.targetFieldMetadata.id,
      sourceObjectMetadataId: field.relation?.sourceObjectMetadata.id,
      objectMetadataItems,
    });

    if (isDefined(junctionConfig)) {
      inlineRelationFields.push(field);
      junctionRelationFields.push(field);
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
