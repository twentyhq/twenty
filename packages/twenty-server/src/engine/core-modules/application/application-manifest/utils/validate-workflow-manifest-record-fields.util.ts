import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  buildWorkflowRecordKeysByFieldReference,
  type WorkflowRecordFieldReferenceSource,
} from 'twenty-shared/workflow';
import {
  type WorkflowManifestFieldReference,
  type WorkflowManifestObjectReference,
  type WorkflowManifestReferences,
} from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

const toFieldReferenceSource = ({
  field,
  objectByUniversalIdentifier,
}: {
  field: Pick<
    WorkflowManifestFieldReference,
    | 'name'
    | 'type'
    | 'universalSettings'
    | 'relationTargetObjectMetadataUniversalIdentifier'
  >;
  objectByUniversalIdentifier: ReadonlyMap<
    string,
    WorkflowManifestObjectReference
  >;
}): WorkflowRecordFieldReferenceSource => {
  const isManyToOneRelation =
    (field.type === FieldMetadataType.RELATION ||
      field.type === FieldMetadataType.MORPH_RELATION) &&
    isDefined(field.universalSettings) &&
    'relationType' in field.universalSettings &&
    field.universalSettings.relationType === RelationType.MANY_TO_ONE;

  if (!isManyToOneRelation) {
    return { name: field.name };
  }

  const morphTarget =
    field.type === FieldMetadataType.MORPH_RELATION &&
    isDefined(field.relationTargetObjectMetadataUniversalIdentifier)
      ? objectByUniversalIdentifier.get(
          field.relationTargetObjectMetadataUniversalIdentifier,
        )
      : undefined;

  return {
    name: field.name,
    manyToOneRelation: {
      joinColumnName: computeMorphOrRelationFieldJoinColumnName({
        name: field.name,
      }),
      morphName: isDefined(morphTarget)
        ? getMorphNameFromMorphFieldMetadataName({
            morphRelationFlatFieldMetadata: {
              name: field.name,
              universalSettings: { relationType: RelationType.MANY_TO_ONE },
            },
            nameSingular: morphTarget.nameSingular,
            namePlural: morphTarget.namePlural ?? morphTarget.nameSingular,
          })
        : undefined,
    },
  };
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
  const fieldReferenceSourcesByObjectIdentifier = new Map<
    string,
    WorkflowRecordFieldReferenceSource[]
  >();
  for (const field of fieldByUniversalIdentifier.values()) {
    fieldReferenceSourcesByObjectIdentifier.set(
      field.objectUniversalIdentifier,
      [
        ...(fieldReferenceSourcesByObjectIdentifier.get(
          field.objectUniversalIdentifier,
        ) ?? []),
        toFieldReferenceSource({ field, objectByUniversalIdentifier }),
      ],
    );
  }
  const recordKeysByFieldReferenceByObjectName = new Map(
    [...objectByUniversalIdentifier].map(([universalIdentifier, object]) => [
      object.nameSingular,
      buildWorkflowRecordKeysByFieldReference(
        fieldReferenceSourcesByObjectIdentifier.get(universalIdentifier) ?? [],
      ),
    ]),
  );

  for (const step of steps) {
    if (
      step.type !== 'CREATE_RECORD' &&
      step.type !== 'UPDATE_RECORD' &&
      step.type !== 'UPSERT_RECORD'
    ) {
      continue;
    }
    const recordKeysByFieldReference =
      recordKeysByFieldReferenceByObjectName.get(
        step.settings.input.objectName,
      );
    if (!isDefined(recordKeysByFieldReference)) {
      errors.push(
        `Workflow step ${step.name}: unknown object ${step.settings.input.objectName}`,
      );
      continue;
    }
    const objectRecord = step.settings.input.objectRecord;
    for (const name of Object.keys(objectRecord)) {
      if (!recordKeysByFieldReference.has(name)) {
        errors.push(`Workflow step ${step.name}: unknown record field ${name}`);
      }
    }

    if (
      step.type === 'UPDATE_RECORD' &&
      (!isDefined(step.settings.input.fieldsToUpdate) ||
        step.settings.input.fieldsToUpdate.length === 0 ||
        step.settings.input.fieldsToUpdate.some(
          (name) =>
            !(recordKeysByFieldReference.get(name) ?? []).some(
              (objectRecordKey) =>
                Object.prototype.hasOwnProperty.call(
                  objectRecord,
                  objectRecordKey,
                ),
            ),
        ))
    ) {
      errors.push(
        `Workflow step ${step.name}: fieldsToUpdate must select existing fields with values in objectRecord`,
      );
    }
  }
  return errors;
};
