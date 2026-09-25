import { fromWorkflowStepManifestToAction } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-step-manifest-to-action.util';
import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
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
import { v4 } from 'uuid';

import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';
import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';

export const fromWorkflowManifestToCoreDefinitionsOrThrow = ({
  manifest,
  applicationUniversalIdentifier,
  existingWorkflow,
  existingVersion,
  now,
  ...references
}: {
  manifest: WorkflowManifest;
  applicationUniversalIdentifier: string;
  existingWorkflow?: FlatWorkflow;
  existingVersion?: FlatWorkflowVersion;
  now: string;
} & WorkflowManifestReferences): {
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

  const steps = definition.version.steps.map((step, index) =>
    fromWorkflowStepManifestToAction({ step, index, references }),
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
