import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type FieldDependency,
  type FieldDependencyGraph,
} from '@/object-record/record-field-dependency/types/FieldDependency';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';
import { RelationType } from '~/generated-metadata/graphql';

const getTargetObjectId = (field: FieldMetadataItem): string | undefined =>
  field.relation?.targetObjectMetadata?.id;

const isManyToOneRelationField = (field: FieldMetadataItem): boolean => {
  return (
    field.relation?.type === RelationType.MANY_TO_ONE ||
    (field.settings as Record<string, unknown> | null)?.relationType ===
      RelationType.MANY_TO_ONE
  );
};

export const computeFieldDependencyGraph = (
  currentObjectMetadata: ObjectMetadataItem,
  allObjectMetadataItems: ObjectMetadataItem[],
): FieldDependencyGraph => {
  const dependenciesByField: Record<string, FieldDependency[]> = {};
  const dependentsByField: Record<string, FieldDependency[]> = {};

  const manyToOneFields = currentObjectMetadata.fields.filter(
    isManyToOneRelationField,
  );

  for (const parentField of manyToOneFields) {
    const parentTargetObjectId = getTargetObjectId(parentField);

    if (!parentTargetObjectId) {
      continue;
    }

    const parentTargetObject = allObjectMetadataItems.find(
      (item) => item.id === parentTargetObjectId,
    );

    if (!parentTargetObject) {
      continue;
    }

    for (const dependentField of manyToOneFields) {
      if (dependentField.id === parentField.id) {
        continue;
      }

      const dependentTargetObjectId = getTargetObjectId(dependentField);

      if (!dependentTargetObjectId) {
        continue;
      }

      const dependentTargetObject = allObjectMetadataItems.find(
        (item) => item.id === dependentTargetObjectId,
      );

      if (!dependentTargetObject) {
        continue;
      }

      const bridgeField = dependentTargetObject.fields.find(
        (field) =>
          isManyToOneRelationField(field) &&
          getTargetObjectId(field) === parentTargetObjectId,
      );

      if (!bridgeField) {
        continue;
      }

      const bridgeForeignKeyName = getForeignKeyNameFromRelationFieldName(
        bridgeField.name,
      );

      const forwardDependency = {
        dependentFieldName: dependentField.name,
        dependentFieldMetadataId: dependentField.id,
        parentFieldName: parentField.name,
        parentFieldMetadataId: parentField.id,
        bridgeFieldForeignKeyName: bridgeForeignKeyName,
        direction: 'forward' as const,
      };

      if (!dependenciesByField[dependentField.name]) {
        dependenciesByField[dependentField.name] = [];
      }
      dependenciesByField[dependentField.name].push(forwardDependency);

      if (!dependentsByField[parentField.name]) {
        dependentsByField[parentField.name] = [];
      }
      dependentsByField[parentField.name].push(forwardDependency);

      const reverseDependency = {
        dependentFieldName: parentField.name,
        dependentFieldMetadataId: parentField.id,
        parentFieldName: dependentField.name,
        parentFieldMetadataId: dependentField.id,
        bridgeFieldForeignKeyName: bridgeForeignKeyName,
        direction: 'reverse' as const,
      };

      if (!dependenciesByField[parentField.name]) {
        dependenciesByField[parentField.name] = [];
      }
      dependenciesByField[parentField.name].push(reverseDependency);

      if (!dependentsByField[dependentField.name]) {
        dependentsByField[dependentField.name] = [];
      }
      dependentsByField[dependentField.name].push(reverseDependency);
    }
  }

  return { dependenciesByField, dependentsByField };
};
