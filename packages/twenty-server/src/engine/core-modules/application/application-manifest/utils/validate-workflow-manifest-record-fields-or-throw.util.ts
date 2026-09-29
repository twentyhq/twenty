import { msg } from '@lingui/core/macro';
import { type WorkflowStepManifest } from 'twenty-shared/application';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

export const validateWorkflowManifestRecordFieldsOrThrow = ({
  step,
  references,
}: {
  step: WorkflowStepManifest;
  references: WorkflowManifestReferences;
}): void => {
  if (
    step.type !== 'CREATE_RECORD' &&
    step.type !== 'UPDATE_RECORD' &&
    step.type !== 'UPSERT_RECORD'
  ) {
    return;
  }

  const fieldNames = new Set<string>();
  for (const field of references.fieldByUniversalIdentifier?.values() ?? []) {
    if (
      field.objectUniversalIdentifier !== step.input.objectUniversalIdentifier
    ) {
      continue;
    }
    fieldNames.add(field.name);
    if (
      (field.type === FieldMetadataType.RELATION ||
        field.type === FieldMetadataType.MORPH_RELATION) &&
      isDefined(field.settings) &&
      'relationType' in field.settings &&
      field.settings.relationType === RelationType.MANY_TO_ONE
    ) {
      fieldNames.add(
        computeMorphOrRelationFieldJoinColumnName({ name: field.name }),
      );
      const target = isDefined(
        field.relationTargetObjectMetadataUniversalIdentifier,
      )
        ? references.objectByUniversalIdentifier?.get(
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

  const unknownField = Object.keys(step.input.objectRecord).find(
    (name) => !fieldNames.has(name),
  );
  if (isDefined(unknownField)) {
    throw new ApplicationException(
      `Workflow step ${step.name}: unknown record field ${unknownField}`,
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`The workflow writes a field that does not exist on its object.`,
      },
    );
  }

  if (
    step.type === 'UPDATE_RECORD' &&
    (step.input.fieldsToUpdate.length === 0 ||
      step.input.fieldsToUpdate.some(
        (name) =>
          !fieldNames.has(name) ||
          !Object.prototype.hasOwnProperty.call(step.input.objectRecord, name),
      ))
  ) {
    throw new ApplicationException(
      `Workflow step ${step.name}: fieldsToUpdate must select existing fields with values in objectRecord`,
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`Select existing fields and provide their values for the workflow update step.`,
      },
    );
  }
};
