import { msg } from '@lingui/core/macro';
import { type WorkflowStepManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { workflowActionSchema } from 'twenty-shared/workflow';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const fromWorkflowStepManifestToAction = ({
  step,
  index,
  references,
}: {
  step: WorkflowStepManifest;
  index: number;
  references: WorkflowManifestReferences;
}): WorkflowAction => {
  const resolve = <T>(
    map: ReadonlyMap<string, T> | undefined,
    identifier: string,
    kind: string,
  ): T => {
    const value = map?.get(identifier);
    if (!isDefined(value)) {
      throw new ApplicationException(
        `Workflow step ${step.name}: missing ${kind} ${identifier}`,
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`The workflow references metadata that is not available to this application.`,
        },
      );
    }
    return value;
  };
  const objectName = (identifier: string) =>
    resolve(references.objectByUniversalIdentifier, identifier, 'object')
      .nameSingular;
  const field = (identifier: string, objectUniversalIdentifier?: string) => {
    const resolved = resolve(
      references.fieldByUniversalIdentifier,
      identifier,
      'field',
    );
    if (
      isDefined(objectUniversalIdentifier) &&
      resolved.objectUniversalIdentifier !== objectUniversalIdentifier
    ) {
      throw new ApplicationException(
        'Workflow field does not belong to the referenced object',
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }
    return resolved;
  };
  const fieldReference = <
    T extends { fieldMetadataUniversalIdentifier?: string },
  >(
    reference: T,
    objectUniversalIdentifier?: string,
  ) => {
    const { fieldMetadataUniversalIdentifier, ...rest } = reference;
    return {
      ...rest,
      ...(isDefined(fieldMetadataUniversalIdentifier)
        ? {
            fieldMetadataId: field(
              fieldMetadataUniversalIdentifier,
              objectUniversalIdentifier,
            ).id,
          }
        : {}),
    };
  };
  let input: unknown;
  switch (step.type) {
    case 'CODE':
    case 'LOGIC_FUNCTION':
      input = {
        logicFunctionId: resolve(
          step.type === 'CODE'
            ? references.codeFunctionIdByUniversalIdentifier
            : references.logicFunctionIdByUniversalIdentifier,
          step.logicFunctionUniversalIdentifier,
          step.type === 'CODE'
            ? 'application code function'
            : 'application workflow action',
        ),
        logicFunctionInput: step.input,
      };
      break;
    case 'AI_AGENT': {
      const { agentUniversalIdentifier, ...rest } = step.input;
      input = {
        ...rest,
        ...(isDefined(agentUniversalIdentifier)
          ? {
              agentId: resolve(
                references.agentIdByUniversalIdentifier,
                agentUniversalIdentifier,
                'application agent',
              ),
            }
          : {}),
      };
      break;
    }
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'UPSERT_RECORD':
    case 'DELETE_RECORD': {
      const { objectUniversalIdentifier, ...rest } = step.input;
      input = { ...rest, objectName: objectName(objectUniversalIdentifier) };
      break;
    }
    case 'FIND_RECORDS': {
      const { objectUniversalIdentifier, filter, orderBy, ...rest } =
        step.input;
      input = {
        ...rest,
        objectName: objectName(objectUniversalIdentifier),
        ...(isDefined(filter)
          ? {
              filter: {
                ...filter,
                ...(isDefined(filter.recordFilters)
                  ? {
                      recordFilters: filter.recordFilters.map((reference) =>
                        fieldReference(reference, objectUniversalIdentifier),
                      ),
                    }
                  : {}),
              },
            }
          : {}),
        ...(isDefined(orderBy)
          ? {
              orderBy: {
                ...orderBy,
                ...(isDefined(orderBy.recordSorts)
                  ? {
                      recordSorts: orderBy.recordSorts.map((reference) =>
                        fieldReference(reference, objectUniversalIdentifier),
                      ),
                    }
                  : {}),
              },
            }
          : {}),
      };
      break;
    }
    case 'PICK_RECORD': {
      const { objectUniversalIdentifier, loadBalance, ...rest } = step.input;
      input = {
        ...rest,
        objectName: objectName(objectUniversalIdentifier),
        ...(isDefined(loadBalance)
          ? {
              loadBalance: {
                objectNameSingular: objectName(
                  loadBalance.objectUniversalIdentifier,
                ),
                fieldName: field(
                  loadBalance.fieldUniversalIdentifier,
                  loadBalance.objectUniversalIdentifier,
                ).name,
              },
            }
          : {}),
      };
      break;
    }
    case 'FORM':
      input = step.input.map((formField) => {
        if (formField.type !== 'RECORD') return formField;
        const { objectUniversalIdentifier, ...settings } =
          formField.settings ?? {};
        return {
          ...formField,
          settings: {
            ...settings,
            objectName: objectName(objectUniversalIdentifier as string),
          },
        };
      });
      break;
    case 'FILTER':
    case 'IF_ELSE':
      input = {
        ...step.input,
        stepFilters: step.input.stepFilters.map((reference) =>
          fieldReference(reference),
        ),
      };
      break;
    default:
      input = step.input;
  }
  return workflowActionSchema.parse({
    id: step.universalIdentifier,
    name: step.name,
    type: step.type,
    valid: true,
    nextStepIds: step.nextStepIds,
    position: step.position ?? { x: 0, y: (index + 1) * 180 },
    settings: {
      input: structuredClone(input),
      outputSchema: structuredClone(step.outputSchema ?? {}),
      ...(isDefined(step.expectedOutputSchema)
        ? { expectedOutputSchema: structuredClone(step.expectedOutputSchema) }
        : {}),
      errorHandlingOptions: step.errorHandlingOptions ?? {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
    },
  }) as WorkflowAction;
};
