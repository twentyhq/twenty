import { createHash } from 'crypto';
import { z } from 'zod';
import { fromWorkflowStepManifestToActionOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-step-manifest-to-action-or-throw.util';
import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  getWorkflowVersionUniversalIdentifier,
  type WorkflowManifest,
  workflowManifestSchema,
} from 'twenty-shared/application';
import { WorkflowVisibility } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import {
  type WorkflowManualTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';

export const fromWorkflowManifestToUniversalFlatWorkflowOrThrow = ({
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
} & WorkflowManifestReferences): UniversalFlatWorkflow & { id: string } => {
  const parsed = z
    .strictObject(workflowManifestSchema.shape)
    .safeParse(manifest);
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
  const versionUniversalIdentifier = getWorkflowVersionUniversalIdentifier({
    applicationUniversalIdentifier,
    workflowUniversalIdentifier: definition.universalIdentifier,
  });

  const steps = definition.version.steps.map((step, index) =>
    fromWorkflowStepManifestToActionOrThrow({ step, index, references }),
  );

  const trigger = {
    ...definition.version.trigger,
    name: 'Manual trigger',
    type: WorkflowTriggerType.MANUAL,
    position: { x: 0, y: 0 },
    settings: { outputSchema: {} },
  } satisfies WorkflowManualTrigger;
  return {
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
    versionDefinitionHash: createHash('sha256')
      .update(JSON.stringify({ trigger, steps }))
      .digest('hex'),
    flatUniversalWorkflowVersion: {
      id: versionId,
      universalIdentifier: versionUniversalIdentifier,
      applicationUniversalIdentifier,
      coreWorkflowId: workflowId,
      workflowId: null,
      workspaceWorkflowVersionId: null,
      isSystemSideEffect: true,
      status: WorkflowVersionStatus.ACTIVE,
      triggers: [trigger],
      steps,
      createdAt: existingVersion?.createdAt ?? now,
      updatedAt: now,
    },
  };
};
