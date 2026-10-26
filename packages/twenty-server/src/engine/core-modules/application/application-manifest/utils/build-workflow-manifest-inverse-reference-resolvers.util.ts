import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  type WorkflowManifestFieldReference,
  type WorkflowManifestReferences,
} from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';

const UNRESOLVED_REFERENCE = '';

const computeWatchedFieldName = (
  field: WorkflowManifestFieldReference,
): string | undefined => {
  if (
    field.type !== FieldMetadataType.RELATION &&
    field.type !== FieldMetadataType.MORPH_RELATION
  ) {
    return field.name;
  }

  return isDefined(field.universalSettings) &&
    'relationType' in field.universalSettings &&
    field.universalSettings.relationType === RelationType.MANY_TO_ONE
    ? computeMorphOrRelationFieldJoinColumnName({ name: field.name })
    : undefined;
};

const toObjectFieldKey = ({
  objectUniversalIdentifier,
  name,
}: {
  objectUniversalIdentifier: string;
  name: string;
}) => `${objectUniversalIdentifier}:${name}`;

const invertIdentifierMap = (
  idByUniversalIdentifier: ReadonlyMap<string, string> | undefined,
): Map<string, string> =>
  new Map(
    [...(idByUniversalIdentifier ?? new Map<string, string>())].map(
      ([universalIdentifier, id]) => [id, universalIdentifier],
    ),
  );

// Unresolved references resolve to an empty string and record the first reason,
// so converters build the whole manifest and report one reason at the end.
export const buildWorkflowManifestInverseReferenceResolvers = (
  references: WorkflowManifestReferences,
) => {
  const unsupportedReasons: string[] = [];
  const objectUniversalIdentifierByNameSingular = new Map<string, string>();
  const fieldUniversalIdentifierById = new Map<string, string>();
  const fieldUniversalIdentifierByObjectFieldName = new Map<string, string>();
  const fieldUniversalIdentifierByWatchedFieldName = new Map<string, string>();
  const logicFunctionUniversalIdentifierById = invertIdentifierMap(
    references.logicFunctionIdByUniversalIdentifier,
  );
  const agentUniversalIdentifierById = invertIdentifierMap(
    references.agentIdByUniversalIdentifier,
  );

  for (const [
    universalIdentifier,
    object,
  ] of references.objectByUniversalIdentifier ?? []) {
    objectUniversalIdentifierByNameSingular.set(
      object.nameSingular,
      universalIdentifier,
    );
  }

  for (const [
    universalIdentifier,
    field,
  ] of references.fieldByUniversalIdentifier ?? []) {
    const { objectUniversalIdentifier } = field;
    const watchedFieldName = computeWatchedFieldName(field);

    fieldUniversalIdentifierById.set(field.id, universalIdentifier);
    fieldUniversalIdentifierByObjectFieldName.set(
      toObjectFieldKey({ objectUniversalIdentifier, name: field.name }),
      universalIdentifier,
    );

    if (isDefined(watchedFieldName)) {
      fieldUniversalIdentifierByWatchedFieldName.set(
        toObjectFieldKey({ objectUniversalIdentifier, name: watchedFieldName }),
        universalIdentifier,
      );
    }
  }

  const markUnsupported = (reason: string): string => {
    unsupportedReasons.push(reason);

    return UNRESOLVED_REFERENCE;
  };

  const resolveOrMarkUnsupported = ({
    universalIdentifier,
    reason,
  }: {
    universalIdentifier: string | undefined;
    reason: string;
  }): string => universalIdentifier ?? markUnsupported(reason);

  const objectUniversalIdentifier = (nameSingular: unknown): string =>
    resolveOrMarkUnsupported({
      universalIdentifier:
        typeof nameSingular === 'string'
          ? objectUniversalIdentifierByNameSingular.get(nameSingular)
          : undefined,
      reason: 'workflow referencing an object that is not exported',
    });

  const fieldUniversalIdentifier = (fieldMetadataId: unknown): string =>
    resolveOrMarkUnsupported({
      universalIdentifier:
        typeof fieldMetadataId === 'string'
          ? fieldUniversalIdentifierById.get(fieldMetadataId)
          : undefined,
      reason: 'workflow referencing a field that is not exported',
    });

  const fieldUniversalIdentifierByName = ({
    objectUniversalIdentifier,
    fieldName,
  }: {
    objectUniversalIdentifier: string;
    fieldName: unknown;
  }): string =>
    resolveOrMarkUnsupported({
      universalIdentifier:
        typeof fieldName === 'string'
          ? fieldUniversalIdentifierByObjectFieldName.get(
              toObjectFieldKey({ objectUniversalIdentifier, name: fieldName }),
            )
          : undefined,
      reason: 'workflow referencing a field that is not exported',
    });

  const watchedFieldUniversalIdentifier = ({
    objectUniversalIdentifier,
    watchedFieldName,
  }: {
    objectUniversalIdentifier: string;
    watchedFieldName: unknown;
  }): string =>
    resolveOrMarkUnsupported({
      universalIdentifier:
        typeof watchedFieldName === 'string'
          ? fieldUniversalIdentifierByWatchedFieldName.get(
              toObjectFieldKey({
                objectUniversalIdentifier,
                name: watchedFieldName,
              }),
            )
          : undefined,
      reason: 'workflow watching a field that is not exported',
    });

  const logicFunctionUniversalIdentifier = (logicFunctionId: unknown): string =>
    resolveOrMarkUnsupported({
      universalIdentifier:
        typeof logicFunctionId === 'string'
          ? logicFunctionUniversalIdentifierById.get(logicFunctionId)
          : undefined,
      reason:
        'workflow step on a logic function that is not a workflow action of this application',
    });

  const agentUniversalIdentifier = (agentId: unknown): string =>
    resolveOrMarkUnsupported({
      universalIdentifier:
        typeof agentId === 'string'
          ? agentUniversalIdentifierById.get(agentId)
          : undefined,
      reason: 'workflow step on an agent of another application',
    });

  const fieldReference = (
    reference: unknown,
  ): Record<string, unknown> | undefined => {
    if (!isPlainObject(reference)) {
      return undefined;
    }

    const { fieldMetadataId, ...rest } = reference;

    return isDefined(fieldMetadataId)
      ? {
          ...rest,
          fieldMetadataUniversalIdentifier:
            fieldUniversalIdentifier(fieldMetadataId),
        }
      : rest;
  };

  return {
    objectUniversalIdentifier,
    fieldUniversalIdentifier,
    fieldReference,
    fieldUniversalIdentifierByName,
    watchedFieldUniversalIdentifier,
    logicFunctionUniversalIdentifier,
    agentUniversalIdentifier,
    markUnsupported,
    getUnsupportedReason: (): string | undefined => unsupportedReasons[0],
  };
};
