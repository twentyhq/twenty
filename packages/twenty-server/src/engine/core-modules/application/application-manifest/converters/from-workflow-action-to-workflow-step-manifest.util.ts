import isEqual from 'lodash.isequal';
import { type WorkflowStepManifest } from 'twenty-shared/application';
import { isDefined, isPlainObject, sortKeysDeeply } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { buildWorkflowManifestInverseReferenceResolvers } from 'src/engine/core-modules/application/application-manifest/utils/build-workflow-manifest-inverse-reference-resolvers.util';
import { computeWorkflowManifestOutputSchema } from 'src/engine/core-modules/application/application-manifest/utils/compute-workflow-manifest-output-schema.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type WorkflowManifestInverseReferenceResolvers = ReturnType<
  typeof buildWorkflowManifestInverseReferenceResolvers
>;

const DEFAULT_ERROR_HANDLING_OPTIONS = {
  retryOnFailure: { value: 0 },
  continueOnFailure: { value: false },
};

const toRecord = (value: unknown): Record<string, unknown> =>
  isPlainObject(value) ? value : {};

const toArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const fromFindRecordsOrderBy = ({
  orderBy,
  resolvers,
}: {
  orderBy: Record<string, unknown>;
  resolvers: WorkflowManifestInverseReferenceResolvers;
}) => {
  const { gqlOperationOrderBy: _gqlOperationOrderBy, ...rest } = orderBy;

  return isDefined(rest.recordSorts)
    ? {
        ...rest,
        recordSorts: toArray(rest.recordSorts).map(resolvers.fieldReference),
      }
    : rest;
};

const fromFindRecordsFilter = ({
  filter,
  resolvers,
}: {
  filter: Record<string, unknown>;
  resolvers: WorkflowManifestInverseReferenceResolvers;
}) => {
  if (!isDefined(filter.recordFilters)) {
    return filter;
  }

  return {
    ...filter,
    recordFilters: toArray(filter.recordFilters).map((recordFilter) => {
      const { relationTargetFieldMetadataId, ...reference } =
        toRecord(recordFilter);

      if (isDefined(relationTargetFieldMetadataId)) {
        resolvers.markUnsupported(
          'workflow filtering on a field of a related record',
        );
      }

      return resolvers.fieldReference(reference);
    }),
  };
};

const fromFindRecordsInput = ({
  input,
  resolvers,
}: {
  input: Record<string, unknown>;
  resolvers: WorkflowManifestInverseReferenceResolvers;
}) => {
  const { objectName, filter, orderBy, ...rest } = input;

  return {
    ...rest,
    objectUniversalIdentifier: resolvers.objectUniversalIdentifier(objectName),
    ...(isPlainObject(filter)
      ? { filter: fromFindRecordsFilter({ filter, resolvers }) }
      : {}),
    ...(isPlainObject(orderBy)
      ? { orderBy: fromFindRecordsOrderBy({ orderBy, resolvers }) }
      : {}),
  };
};

const fromPickRecordInput = ({
  input,
  resolvers,
}: {
  input: Record<string, unknown>;
  resolvers: WorkflowManifestInverseReferenceResolvers;
}) => {
  const { objectName, loadBalance, ...rest } = input;

  if (!isPlainObject(loadBalance)) {
    return {
      ...rest,
      objectUniversalIdentifier:
        resolvers.objectUniversalIdentifier(objectName),
    };
  }

  const loadBalanceObjectUniversalIdentifier =
    resolvers.objectUniversalIdentifier(loadBalance.objectNameSingular);

  return {
    ...rest,
    objectUniversalIdentifier: resolvers.objectUniversalIdentifier(objectName),
    loadBalance: {
      objectUniversalIdentifier: loadBalanceObjectUniversalIdentifier,
      fieldUniversalIdentifier: resolvers.fieldUniversalIdentifierByName({
        objectUniversalIdentifier: loadBalanceObjectUniversalIdentifier,
        fieldName: loadBalance.fieldName,
      }),
    },
  };
};

const fromFormInput = ({
  input,
  resolvers,
}: {
  input: unknown;
  resolvers: WorkflowManifestInverseReferenceResolvers;
}) =>
  toArray(input).map((formField) => {
    const field = toRecord(formField);

    if (field.type === 'SELECT' || field.type === 'MULTI_SELECT') {
      const { selectedFieldId, selectType, ...settings } = toRecord(
        field.settings,
      );

      return {
        ...field,
        settings: {
          // EXISTING_FIELD is what sync writes when the manifest omits it
          ...(isDefined(selectType) && selectType !== 'EXISTING_FIELD'
            ? { selectType }
            : {}),
          ...settings,
          selectedFieldUniversalIdentifier:
            resolvers.fieldUniversalIdentifier(selectedFieldId),
        },
      };
    }

    if (field.type !== 'RECORD') {
      return field;
    }

    const { objectName, ...settings } = toRecord(field.settings);

    return {
      ...field,
      settings: {
        ...settings,
        objectUniversalIdentifier:
          resolvers.objectUniversalIdentifier(objectName),
      },
    };
  });

const fromActionInput = ({
  action,
  resolvers,
}: {
  action: WorkflowAction;
  resolvers: WorkflowManifestInverseReferenceResolvers;
}): unknown => {
  const input: unknown = action.settings.input;

  switch (action.type) {
    case WorkflowActionType.LOGIC_FUNCTION:
      return toRecord(input).logicFunctionInput;
    case WorkflowActionType.AI_AGENT: {
      const { agentId, ...rest } = toRecord(input);

      return {
        ...rest,
        agentUniversalIdentifier: resolvers.agentUniversalIdentifier(agentId),
      };
    }
    case WorkflowActionType.CREATE_RECORD:
    case WorkflowActionType.UPDATE_RECORD:
    case WorkflowActionType.UPSERT_RECORD:
    case WorkflowActionType.DELETE_RECORD: {
      const { objectName, ...rest } = toRecord(input);

      return {
        ...rest,
        objectUniversalIdentifier:
          resolvers.objectUniversalIdentifier(objectName),
      };
    }
    case WorkflowActionType.FIND_RECORDS:
      return fromFindRecordsInput({ input: toRecord(input), resolvers });
    case WorkflowActionType.PICK_RECORD:
      return fromPickRecordInput({ input: toRecord(input), resolvers });
    case WorkflowActionType.FORM:
      return fromFormInput({ input, resolvers });
    case WorkflowActionType.FILTER:
    case WorkflowActionType.IF_ELSE: {
      const record = toRecord(input);

      return {
        ...record,
        stepFilters: toArray(record.stepFilters).map(resolvers.fieldReference),
      };
    }
    case WorkflowActionType.HTTP_REQUEST:
    case WorkflowActionType.CLASSIFY:
    case WorkflowActionType.ITERATOR:
    case WorkflowActionType.DELAY:
    case WorkflowActionType.WAIT_FOR_EVENT:
    case WorkflowActionType.EMPTY:
      return input;
    default:
      return resolvers.markUnsupported(
        `${action.type} steps are not supported in application workflows`,
      );
  }
};

export const fromWorkflowActionToWorkflowStepManifest = ({
  action,
  index,
  references,
}: {
  action: WorkflowAction;
  index: number;
  references: WorkflowManifestReferences;
}): { manifest: WorkflowStepManifest } | { reason: string } => {
  const resolvers = buildWorkflowManifestInverseReferenceResolvers(references);
  const input = sortKeysDeeply(fromActionInput({ action, resolvers }));
  const logicFunctionUniversalIdentifier =
    action.type === WorkflowActionType.LOGIC_FUNCTION
      ? resolvers.logicFunctionUniversalIdentifier(
          action.settings.input.logicFunctionId,
        )
      : undefined;
  const unsupportedReason = resolvers.getUnsupportedReason();

  if (isDefined(unsupportedReason)) {
    return { reason: unsupportedReason };
  }

  const { outputSchema, errorHandlingOptions } = action.settings;
  const expectedOutputSchema =
    'expectedOutputSchema' in action.settings
      ? action.settings.expectedOutputSchema
      : undefined;
  const stepWithoutOutputSchema = {
    universalIdentifier: action.id,
    name: action.name,
    type: action.type,
    ...(isDefined(logicFunctionUniversalIdentifier)
      ? { logicFunctionUniversalIdentifier }
      : {}),
    nextStepIds: action.nextStepIds ?? [],
    ...(isDefined(action.position) &&
    !isEqual(action.position, { x: 0, y: (index + 1) * 180 })
      ? { position: { x: action.position.x, y: action.position.y } }
      : {}),
    input,
  } as WorkflowStepManifest;
  const isDefaultOutputSchema = isEqual(
    outputSchema,
    computeWorkflowManifestOutputSchema({
      step: {
        ...stepWithoutOutputSchema,
        ...(isDefined(expectedOutputSchema)
          ? { expectedOutputSchema: toRecord(expectedOutputSchema) }
          : {}),
      },
      references,
    }),
  );

  return {
    manifest: {
      ...stepWithoutOutputSchema,
      ...(isDefaultOutputSchema
        ? {}
        : { outputSchema: sortKeysDeeply(toRecord(outputSchema)) }),
      ...(isDefined(expectedOutputSchema)
        ? {
            expectedOutputSchema: sortKeysDeeply(
              toRecord(expectedOutputSchema),
            ),
          }
        : {}),
      ...(!isDefined(errorHandlingOptions) ||
      isEqual(errorHandlingOptions, DEFAULT_ERROR_HANDLING_OPTIONS)
        ? {}
        : {
            errorHandlingOptions: {
              retryOnFailure: {
                value: errorHandlingOptions.retryOnFailure.value,
              },
              continueOnFailure: {
                value: errorHandlingOptions.continueOnFailure.value,
              },
            },
          }),
    },
  };
};
