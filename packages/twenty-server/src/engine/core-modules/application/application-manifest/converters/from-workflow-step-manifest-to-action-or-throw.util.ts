import { computeWorkflowManifestOutputSchema } from 'src/engine/core-modules/application/application-manifest/utils/compute-workflow-manifest-output-schema.util';
import { computeWorkflowManifestOrderBy } from 'src/engine/core-modules/application/application-manifest/utils/compute-workflow-manifest-order-by.util';
import { buildWorkflowManifestReferenceResolvers } from 'src/engine/core-modules/application/application-manifest/utils/build-workflow-manifest-reference-resolvers.util';
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

export const fromWorkflowStepManifestToActionOrThrow = ({
  step,
  index,
  references,
}: {
  step: WorkflowStepManifest;
  index: number;
  references: WorkflowManifestReferences;
}): WorkflowAction => {
  const { resolve, objectName, field, fieldReference } =
    buildWorkflowManifestReferenceResolvers({
      references,
      subject: `Workflow step ${step.name}`,
    });
  let input: unknown;
  switch (step.type) {
    case 'LOGIC_FUNCTION':
      input = {
        logicFunctionId: resolve(
          references.logicFunctionIdByUniversalIdentifier,
          step.logicFunctionUniversalIdentifier,
          'application workflow action',
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
                      gqlOperationOrderBy: orderBy.recordSorts.flatMap(
                        (reference) =>
                          computeWorkflowManifestOrderBy({
                            field: field(
                              reference.fieldMetadataUniversalIdentifier,
                              objectUniversalIdentifier,
                            ),
                            direction: reference.direction,
                            subFieldName: reference.subFieldName,
                            references,
                          }),
                      ),
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
        if (formField.type !== 'RECORD') {
          return formField;
        }
        const { objectUniversalIdentifier, ...settings } =
          formField.settings ?? {};
        if (typeof objectUniversalIdentifier !== 'string') {
          throw new ApplicationException(
            'Record picker fields require an object universal identifier',
            ApplicationExceptionCode.INVALID_INPUT,
            {
              userFriendlyMessage: msg`The workflow record picker must reference an object.`,
            },
          );
        }
        return {
          ...formField,
          settings: {
            ...settings,
            objectName: objectName(objectUniversalIdentifier),
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
      outputSchema: structuredClone(
        computeWorkflowManifestOutputSchema({ step, references }),
      ),
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
