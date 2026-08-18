import { FieldsListType, RelationType } from "src/logic-functions/types/find-objects-fields.type";
import { CreateOneFieldType, RelationCreationPayload } from "src/logic-functions/types/create-one-field.type";
import { FieldMetadataType } from "src/logic-functions/types/field-metadata-type.enum";

export const buildFieldToCreate = (
  field: FieldsListType,
  targetObjectId: string,
  targetObjects: { nameSingular: string, id: string, universalIdentifier: string }[],
): CreateOneFieldType | undefined => {
  if (field.type === FieldMetadataType.RELATION) {
    const targetRelationObjectId = targetObjects.find(
      obj => obj.nameSingular === field.relation?.targetObjectMetadata.nameSingular,
    )?.id;

    if (targetRelationObjectId === undefined) {
      console.warn(`Skipping relation field "${field.name}": relation target object not found in target workspace yet (possible dependency cycle)`);
      return undefined;
    }

    const relationCreationPayload = {
      type: RelationType.MANY_TO_ONE,
      targetObjectMetadataId: targetRelationObjectId,
      targetFieldLabel: field.relation.targetFieldMetadata.label,
      targetFieldIcon: field.relation.targetFieldMetadata.icon,
    };
    return {
      objectMetadataId: targetObjectId,
      type: field.type,
      name: field.name,
      label: field.label,
      description: field.description,
      icon: field.icon,
      isActive: field.isActive,
      isNullable: field.isNullable,
      isUnique: field.isUnique,
      isUIEditable: field.isUIEditable,
      isUIReadOnly: field.isUIReadOnly,
      isLabelSyncedWithName: field.isLabelSyncedWithName,
      defaultValue: field.defaultValue,
      settings: field.settings,
      relationCreationPayload: relationCreationPayload,
    } as CreateOneFieldType;
  }

  if (field.type === 'MORPH_RELATION') {
    const morphRelationPayload: RelationCreationPayload[] = [];
    for (const relation of field.morphRelations) {
      const targetRelationObjectId = targetObjects.find(
        obj => obj.nameSingular === relation.targetObjectMetadata.nameSingular,
      )?.id;

      if (targetRelationObjectId === undefined) {
        console.warn(`Skipping relation field "${field.name}": relation target object not found in target workspace yet (possible dependency cycle)`);
        return undefined;
      }

      morphRelationPayload.push({
        type: RelationType.MANY_TO_ONE,
        targetObjectMetadataId: targetRelationObjectId,
        targetFieldLabel: relation.targetFieldMetadata.label,
        targetFieldIcon: relation.targetFieldMetadata.icon,
      });
    }
    return {
      objectMetadataId: targetObjectId,
      type: field.type,
      name: field.name,
      label: field.label,
      description: field.description,
      icon: field.icon,
      isActive: field.isActive,
      isNullable: field.isNullable,
      isUnique: field.isUnique,
      isUIEditable: field.isUIEditable,
      isUIReadOnly: field.isUIReadOnly,
      isLabelSyncedWithName: field.isLabelSyncedWithName,
      defaultValue: field.defaultValue,
      settings: field.settings,
      morphRelationsCreationPayload: morphRelationPayload,
    } as CreateOneFieldType;
  }

  return {
    objectMetadataId: targetObjectId,
    type: field.type,
    name: field.name,
    label: field.label,
    description: field.description,
    icon: field.icon,
    isActive: field.isActive,
    isNullable: field.isNullable,
    isUnique: field.isUnique,
    isUIEditable: field.isUIEditable,
    isUIReadOnly: field.isUIReadOnly,
    isLabelSyncedWithName: field.isLabelSyncedWithName,
    defaultValue: field.defaultValue,
    options: field.options,
    settings: field.settings,
  } as CreateOneFieldType;
};