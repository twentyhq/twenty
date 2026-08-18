import { FieldRelationInfo, FieldsListType, ObjectType } from "src/logic-functions/types/find-objects-fields.type";

export const areObjectsIdentical = (a: ObjectType, b: ObjectType) => {
  return a.color === b.color &&
    a.description === b.description &&
    a.isLabelSyncedWithName === b.isLabelSyncedWithName &&
    a.labelPlural === b.labelPlural &&
    a.labelSingular === b.labelSingular &&
    a.nameSingular === b.nameSingular &&
    a.namePlural === b.namePlural &&
    a.icon === b.icon;
}

export const areRelationsIdentical = (a: FieldRelationInfo, b: FieldRelationInfo) => {
  return a.targetObjectMetadata.nameSingular === b.targetObjectMetadata.nameSingular &&
    a.targetFieldMetadata.icon === b.targetFieldMetadata.icon &&
    a.targetFieldMetadata.label === b.targetFieldMetadata.label;
}

export const areMorphRelationsIdentical = (a: FieldRelationInfo[], b: FieldRelationInfo[]) => {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((relationA) => {
    const relationB = b.find(
      (candidate) => candidate.targetObjectMetadata.nameSingular === relationA.targetObjectMetadata.nameSingular,
    );
    return relationB !== undefined && areRelationsIdentical(relationA, relationB);
  });
}

export const areFieldsListsIdentical = (a: FieldsListType, b: FieldsListType) => {
  if (a.type === 'RELATION' && b.type === 'RELATION') {
    return a.description === b.description &&
      a.icon === b.icon &&
      a.isActive === b.isActive &&
      a.isLabelSyncedWithName === b.isLabelSyncedWithName &&
      a.isNullable === b.isNullable &&
      a.isUIEditable === b.isUIEditable &&
      a.isUIReadOnly === b.isUIReadOnly &&
      a.isUnique === b.isUnique &&
      a.label === b.label &&
      a.name === b.name &&
      JSON.stringify(a.settings) === JSON.stringify(b.settings) &&
      areRelationsIdentical(a.relation, b.relation);
  }

  if (a.type === 'MORPH_RELATION' && b.type === 'MORPH_RELATION') {
    return a.description === b.description &&
      a.icon === b.icon &&
      a.isActive === b.isActive &&
      a.isLabelSyncedWithName === b.isLabelSyncedWithName &&
      a.isNullable === b.isNullable &&
      a.isUIEditable === b.isUIEditable &&
      a.isUIReadOnly === b.isUIReadOnly &&
      a.isUnique === b.isUnique &&
      a.label === b.label &&
      a.name === b.name &&
      JSON.stringify(a.settings) === JSON.stringify(b.settings) &&
      areMorphRelationsIdentical(a.morphRelations, b.morphRelations);
  }

  return JSON.stringify(a.defaultValue) === JSON.stringify(b.defaultValue) &&
    a.description === b.description &&
    a.icon === b.icon &&
    a.isActive === b.isActive &&
    a.isLabelSyncedWithName === b.isLabelSyncedWithName &&
    a.isNullable === b.isNullable &&
    a.isUIEditable === b.isUIEditable &&
    a.isUIReadOnly === b.isUIReadOnly &&
    a.isUnique === b.isUnique &&
    a.label === b.label &&
    a.name === b.name &&
    JSON.stringify(a.options) === JSON.stringify(b.options) &&
    JSON.stringify(a.settings) === JSON.stringify(b.settings);
}