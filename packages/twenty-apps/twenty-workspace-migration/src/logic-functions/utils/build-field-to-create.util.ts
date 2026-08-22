import { FieldsListType, RelationType } from "src/logic-functions/types/find-objects-fields.type";
import { CreateOneFieldType, RelationCreationPayload } from "src/logic-functions/types/create-one-field.type";
import { FieldMetadataType } from "src/logic-functions/types/field-metadata-type.enum";
import { logger } from "src/logic-functions/utils/logger.util";

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
      logger.warn(`Skipping relation field "${field.name}": relation target object not found in target workspace yet (possible dependency cycle)`);
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
      options: null
    };
  }

  if (field.type === 'MORPH_RELATION') {
    const morphRelationPayload: RelationCreationPayload[] = [];
    for (const relation of field.morphRelations) {
     const targetRelationObjectId = relation.type === RelationType.MANY_TO_ONE
        ? targetObjects.find(obj => obj.nameSingular === relation.targetObjectMetadata.nameSingular)?.id
        : undefined;

      if (targetRelationObjectId === undefined) {
        logger.warn(`Skipping relation field "${field.name}": relation target object "${relation.targetObjectMetadata.nameSingular}" not found in target workspace yet, or is the inverse side of the relation`);
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
      options: null
    };
  }

  // `field` is narrowed to "neither RELATION nor MORPH_RELATION" at runtime by the two guards
  // above, but the MORPH_RELATION branch's per-relation `relation.type` check above defeats
  // tsc's ability to prove that exhaustively for this object literal (a compiler limitation
  // with this distributed-over-22-variants conditional type, not a real type ambiguity - the
  // same object literal typechecks fine when that check is removed). Hence the cast.
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