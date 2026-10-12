import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type WorkflowManifestFieldReference,
  type WorkflowManifestObjectReference,
  type WorkflowManifestReferences,
} from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

type ObjectFieldNames = {
  fieldNames: Set<string>;
  relationNames: Set<string>;
};

export const validateWorkflowManifestRecordFields = ({
  steps,
  objectByUniversalIdentifier = new Map<
    string,
    WorkflowManifestObjectReference
  >(),
  fieldByUniversalIdentifier = new Map<
    string,
    WorkflowManifestFieldReference
  >(),
}: {
  steps: WorkflowAction[];
} & Pick<
  WorkflowManifestReferences,
  'objectByUniversalIdentifier' | 'fieldByUniversalIdentifier'
>): string[] => {
  const errors: string[] = [];
  const objectFieldsByObjectName = new Map<string, ObjectFieldNames>();
  const objectFieldsByObjectIdentifier = new Map<string, ObjectFieldNames>();
  for (const [universalIdentifier, object] of objectByUniversalIdentifier) {
    const objectFields = {
      fieldNames: new Set<string>(),
      relationNames: new Set<string>(),
    };
    objectFieldsByObjectName.set(object.nameSingular, objectFields);
    objectFieldsByObjectIdentifier.set(universalIdentifier, objectFields);
  }
  for (const field of fieldByUniversalIdentifier.values()) {
    const objectFields = objectFieldsByObjectIdentifier.get(
      field.objectUniversalIdentifier,
    );
    if (!isDefined(objectFields)) {
      continue;
    }
    const { fieldNames, relationNames } = objectFields;
    fieldNames.add(field.name);
    if (
      (field.type === FieldMetadataType.RELATION ||
        field.type === FieldMetadataType.MORPH_RELATION) &&
      isDefined(field.universalSettings) &&
      'relationType' in field.universalSettings &&
      field.universalSettings.relationType === RelationType.MANY_TO_ONE
    ) {
      if (field.type === FieldMetadataType.RELATION) {
        relationNames.add(field.name);
      }
      fieldNames.add(
        computeMorphOrRelationFieldJoinColumnName({ name: field.name }),
      );
      const target = isDefined(
        field.relationTargetObjectMetadataUniversalIdentifier,
      )
        ? objectByUniversalIdentifier.get(
            field.relationTargetObjectMetadataUniversalIdentifier,
          )
        : undefined;
      if (
        field.type === FieldMetadataType.MORPH_RELATION &&
        isDefined(target)
      ) {
        fieldNames.add(
          getMorphNameFromMorphFieldMetadataName({
            morphRelationFlatFieldMetadata: {
              name: field.name,
              universalSettings: { relationType: RelationType.MANY_TO_ONE },
            },
            nameSingular: target.nameSingular,
            namePlural: target.namePlural ?? target.nameSingular,
          }),
        );
      }
    }
  }

  for (const step of steps) {
    if (
      step.type !== 'CREATE_RECORD' &&
      step.type !== 'UPDATE_RECORD' &&
      step.type !== 'UPSERT_RECORD'
    ) {
      continue;
    }
    const objectFields = objectFieldsByObjectName.get(
      step.settings.input.objectName,
    );
    if (!isDefined(objectFields)) {
      errors.push(
        `Workflow step ${step.name}: unknown object ${step.settings.input.objectName}`,
      );
      continue;
    }
    const { fieldNames, relationNames } = objectFields;
    for (const name of Object.keys(step.settings.input.objectRecord)) {
      if (!fieldNames.has(name)) {
        errors.push(`Workflow step ${step.name}: unknown record field ${name}`);
      }
    }

    if (
      step.type === 'UPDATE_RECORD' &&
      (!isDefined(step.settings.input.fieldsToUpdate) ||
        step.settings.input.fieldsToUpdate.length === 0 ||
        step.settings.input.fieldsToUpdate.some(
          (name) =>
            !fieldNames.has(name) ||
            relationNames.has(name) ||
            !Object.prototype.hasOwnProperty.call(
              step.settings.input.objectRecord,
              name,
            ),
        ))
    ) {
      errors.push(
        `Workflow step ${step.name}: fieldsToUpdate must select existing fields with values in objectRecord, using the join column for relations (ownerId, not owner)`,
      );
    }
  }
  return errors;
};
