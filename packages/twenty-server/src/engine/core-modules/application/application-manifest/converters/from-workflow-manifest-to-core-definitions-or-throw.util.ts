import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  type WorkflowManifest,
  workflowManifestSchema,
} from 'twenty-shared/application';
import { WorkflowVisibility } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type WorkflowLogicFunctionAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';
import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';

export const fromWorkflowManifestToCoreDefinitionsOrThrow = ({
  manifest,
  applicationUniversalIdentifier,
  existingWorkflow,
  existingVersion,
  logicFunctionIdByUniversalIdentifier,
  now,
}: {
  manifest: WorkflowManifest;
  applicationUniversalIdentifier: string;
  existingWorkflow?: FlatWorkflow;
  existingVersion?: FlatWorkflowVersion;
  logicFunctionIdByUniversalIdentifier: ReadonlyMap<string, string>;
  now: string;
}): {
  workflow: UniversalFlatWorkflow & { id: string };
  version: UniversalFlatWorkflowVersion & { id: string };
} => {
  const parsed = workflowManifestSchema.safeParse(manifest);
  if (!parsed.success) {
    throw new ApplicationException(
      `Invalid workflow definition: ${parsed.error.message}`,
      ApplicationExceptionCode.INVALID_INPUT,
      { userFriendlyMessage: msg`Invalid application workflow definition.` },
    );
  }
  const definition = parsed.data;
  if (isDefined(existingWorkflow?.workspaceWorkflowId)) {
    throw new ApplicationException(
      'Workspace workflows cannot be adopted by an application',
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`Workspace workflows cannot be adopted by an application.`,
      },
    );
  }

  const workflowId = existingWorkflow?.id ?? v4();
  const versionId = existingVersion?.id ?? v4();

  if (
    isDefined(existingVersion) &&
    existingVersion.coreWorkflowId !== workflowId
  ) {
    throw new ApplicationException(
      'A workflow version cannot move to a different workflow',
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`A workflow version cannot move to a different workflow.`,
      },
    );
  }

  const steps: WorkflowLogicFunctionAction[] = definition.version.steps.map(
    (step, index) => {
      const logicFunctionId = logicFunctionIdByUniversalIdentifier.get(
        step.logicFunctionUniversalIdentifier,
      );
      if (!isDefined(logicFunctionId)) {
        throw new ApplicationException(
          `Workflow ${definition.name}: missing application workflow action ${step.logicFunctionUniversalIdentifier}`,
          ApplicationExceptionCode.INVALID_INPUT,
          {
            userFriendlyMessage: msg`The workflow references a function that is not exposed as an action by this application.`,
          },
        );
      }
      return {
        id: step.universalIdentifier,
        name: step.name,
        type: WorkflowActionType.LOGIC_FUNCTION,
        valid: true,
        nextStepIds: [...step.nextStepIds],
        position: { x: 0, y: (index + 1) * 180 },
        settings: {
          input: {
            logicFunctionId,
            logicFunctionInput: structuredClone(step.input),
          },
          outputSchema: {},
          errorHandlingOptions: {
            retryOnFailure: { value: 0 },
            continueOnFailure: { value: false },
          },
        },
      };
    },
  );

  return {
    workflow: {
      id: workflowId,
      universalIdentifier: definition.universalIdentifier,
      applicationUniversalIdentifier,
      name: definition.name,
      visibility: WorkflowVisibility.WORKSPACE,
      createdByUserWorkspaceId: null,
      workspaceWorkflowId: null,
      lastPublishedVersionId: null,
      lastPublishedCoreWorkflowVersionId: versionId,
      createdAt: existingWorkflow?.createdAt ?? now,
      updatedAt: now,
    },
    version: {
      id: versionId,
      universalIdentifier: definition.version.universalIdentifier,
      applicationUniversalIdentifier,
      coreWorkflowId: workflowId,
      workflowId: null,
      workspaceWorkflowVersionId: null,
      status: WorkflowVersionStatus.ACTIVE,
      triggers: [
        {
          ...definition.version.trigger,
          name: 'Manual trigger',
          type: WorkflowTriggerType.MANUAL,
          position: { x: 0, y: 0 },
          settings: { outputSchema: {} },
        },
      ],
      steps,
      createdAt: existingVersion?.createdAt ?? now,
      updatedAt: now,
    },
  };
};
