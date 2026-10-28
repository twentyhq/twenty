import { isNonEmptyString } from '@sniptt/guards';
import isEqual from 'lodash.isequal';
import {
  type WorkflowManifest,
  type WorkflowStepManifest,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { WORKFLOW_CHANGED_IN_BUILDER_REASON } from 'src/engine/core-modules/application/application-manifest/constants/workflow-changed-in-builder-reason.constant';
import { fromWorkflowActionToWorkflowStepManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-action-to-workflow-step-manifest.util';
import { fromWorkflowManifestToUniversalFlatWorkflowOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-manifest-to-universal-flat-workflow-or-throw.util';
import { fromWorkflowTriggerToWorkflowTriggerManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-trigger-to-workflow-trigger-manifest.util';
import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

const toJsonValue = (value: unknown): unknown =>
  JSON.parse(JSON.stringify(value ?? null));

const isReproducedBySyncOrThrow = ({
  manifest,
  flatWorkflow,
  flatWorkflowVersion,
  references,
}: {
  manifest: WorkflowManifest;
  flatWorkflow: Pick<FlatWorkflow, 'applicationUniversalIdentifier'>;
  flatWorkflowVersion: Pick<
    FlatWorkflowVersion,
    'updatedAt' | 'triggers' | 'steps'
  >;
  references: WorkflowManifestReferences;
}): boolean => {
  const reproducedVersion = fromWorkflowManifestToUniversalFlatWorkflowOrThrow({
    manifest,
    applicationUniversalIdentifier: flatWorkflow.applicationUniversalIdentifier,
    now: flatWorkflowVersion.updatedAt,
    ...references,
  }).flatUniversalWorkflowVersion;

  return isEqual(
    toJsonValue({
      triggers: reproducedVersion?.triggers,
      steps: reproducedVersion?.steps,
    }),
    toJsonValue({
      triggers: flatWorkflowVersion.triggers,
      steps: flatWorkflowVersion.steps,
    }),
  );
};

export const fromFlatWorkflowToWorkflowManifest = ({
  flatWorkflow,
  flatWorkflowVersion,
  references,
}: {
  flatWorkflow: FlatWorkflow;
  flatWorkflowVersion: FlatWorkflowVersion;
  references: WorkflowManifestReferences;
}): { manifest: WorkflowManifest } | { reason: string } => {
  const { triggers, steps } = flatWorkflowVersion;
  const [trigger] = triggers ?? [];

  if (!isNonEmptyString(flatWorkflow.name)) {
    return { reason: 'workflow without a name' };
  }

  if (triggers?.length !== 1 || !isDefined(trigger)) {
    return { reason: 'workflow without exactly one trigger' };
  }

  if (!isNonEmptyArray(steps)) {
    return { reason: 'workflow without steps' };
  }

  const triggerConversion = fromWorkflowTriggerToWorkflowTriggerManifest({
    trigger,
    references,
  });

  if ('reason' in triggerConversion) {
    return triggerConversion;
  }

  const stepManifests: WorkflowStepManifest[] = [];

  for (const [index, action] of steps.entries()) {
    const stepConversion = fromWorkflowActionToWorkflowStepManifest({
      action,
      index,
      references,
    });

    if ('reason' in stepConversion) {
      return stepConversion;
    }

    stepManifests.push(stepConversion.manifest);
  }

  const manifest: WorkflowManifest = {
    universalIdentifier: flatWorkflow.universalIdentifier,
    name: flatWorkflow.name,
    version: { trigger: triggerConversion.manifest, steps: stepManifests },
  };

  try {
    if (
      !isReproducedBySyncOrThrow({
        manifest,
        flatWorkflow,
        flatWorkflowVersion,
        references,
      })
    ) {
      return { reason: WORKFLOW_CHANGED_IN_BUILDER_REASON };
    }
  } catch (error) {
    return {
      reason: `workflow that is not a valid application workflow: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }

  return { manifest };
};
