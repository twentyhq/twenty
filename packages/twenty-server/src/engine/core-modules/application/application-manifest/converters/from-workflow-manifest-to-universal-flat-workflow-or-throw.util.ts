import { createHash } from 'crypto';
import { z } from 'zod';
import { fromWorkflowManifestToUniversalFlatCommandMenuItem } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-manifest-to-universal-flat-command-menu-item.util';
import { fromWorkflowStepManifestToActionOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-step-manifest-to-action-or-throw.util';
import { fromWorkflowTriggerManifestToTriggerOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-trigger-manifest-to-trigger-or-throw.util';
import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { isSameWorkflowVersionDefinition } from 'src/engine/core-modules/application/application-manifest/utils/is-same-workflow-version-definition.util';
import { msg } from '@lingui/core/macro';
import { isDefined, sortKeysDeeply } from 'twenty-shared/utils';
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
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';
import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const fromFlatWorkflowVersionToUniversalFlatWorkflowVersion = ({
  workspaceId: _workspaceId,
  applicationId: _applicationId,
  ...universalFlatWorkflowVersion
}: FlatWorkflowVersion): UniversalFlatWorkflowVersion & { id: string } =>
  universalFlatWorkflowVersion;

const buildPublishedFlatUniversalWorkflowVersion = ({
  trigger,
  ...version
}: Pick<
  UniversalFlatWorkflowVersion,
  | 'universalIdentifier'
  | 'applicationUniversalIdentifier'
  | 'coreWorkflowId'
  | 'workflowId'
  | 'steps'
  | 'createdAt'
  | 'updatedAt'
> & {
  id: string;
  trigger: WorkflowTrigger;
}): UniversalFlatWorkflowVersion & { id: string } => ({
  ...version,
  workspaceWorkflowVersionId: null,
  isSystemSideEffect: true,
  status: WorkflowVersionStatus.ACTIVE,
  triggers: [trigger],
});

export const fromWorkflowManifestToUniversalFlatWorkflowOrThrow = ({
  manifest,
  applicationUniversalIdentifier,
  existingWorkflow,
  existingVersion,
  activeVersion,
  isWorkspaceCustomApplication = false,
  now,
  ...references
}: {
  manifest: WorkflowManifest;
  applicationUniversalIdentifier: string;
  existingWorkflow?: FlatWorkflow;
  existingVersion?: FlatWorkflowVersion;
  activeVersion?: FlatWorkflowVersion;
  isWorkspaceCustomApplication?: boolean;
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
  const workflowId = existingWorkflow?.id ?? v4();

  const steps = definition.version.steps.map((step, index) =>
    fromWorkflowStepManifestToActionOrThrow({ step, index, references }),
  );

  const trigger = fromWorkflowTriggerManifestToTriggerOrThrow({
    trigger: definition.version.trigger,
    references,
  });

  const keptActiveVersion =
    isDefined(activeVersion) &&
    isSameWorkflowVersionDefinition(activeVersion, {
      triggers: [trigger],
      steps,
    })
      ? activeVersion
      : undefined;
  // Each changed definition of a builder-published workflow is a new version, so runs keep what they ran
  const flatUniversalWorkflowVersion = isDefined(keptActiveVersion)
    ? fromFlatWorkflowVersionToUniversalFlatWorkflowVersion(keptActiveVersion)
    : buildPublishedFlatUniversalWorkflowVersion({
        id: existingVersion?.id ?? v4(),
        universalIdentifier: isWorkspaceCustomApplication
          ? v4()
          : getWorkflowVersionUniversalIdentifier({
              applicationUniversalIdentifier,
              workflowUniversalIdentifier: definition.universalIdentifier,
            }),
        applicationUniversalIdentifier,
        coreWorkflowId: workflowId,
        workflowId: existingWorkflow?.workspaceWorkflowId ?? null,
        trigger,
        steps,
        createdAt: existingVersion?.createdAt ?? now,
        updatedAt: now,
      });
  const versionId = flatUniversalWorkflowVersion.id;
  const commandMenuItem = fromWorkflowManifestToUniversalFlatCommandMenuItem({
    manifest: definition,
    applicationUniversalIdentifier,
    coreWorkflowVersionId: versionId,
    now,
  });
  return {
    id: workflowId,
    universalIdentifier: definition.universalIdentifier,
    applicationUniversalIdentifier,
    name: definition.name,
    isSystem: definition.isSystem ?? false,
    visibility: WorkflowVisibility.WORKSPACE,
    createdByUserWorkspaceId: null,
    workspaceWorkflowId: null,
    lastPublishedVersionId: isDefined(keptActiveVersion)
      ? (existingWorkflow?.lastPublishedVersionId ?? null)
      : null,
    lastPublishedCoreWorkflowVersionId: versionId,
    createdAt: existingWorkflow?.createdAt ?? now,
    updatedAt: now,
    versionDefinitionHash: isDefined(keptActiveVersion)
      ? (existingWorkflow?.versionDefinitionHash ?? null)
      : createHash('sha256')
          .update(JSON.stringify(sortKeysDeeply({ trigger, steps })))
          .digest('hex'),
    flatUniversalWorkflowVersion,
    ...(isDefined(commandMenuItem)
      ? { flatUniversalCommandMenuItem: commandMenuItem }
      : {}),
  };
};
