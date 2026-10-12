import { type WorkflowTriggerManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { buildWorkflowManifestReferenceResolvers } from 'src/engine/core-modules/application/application-manifest/utils/build-workflow-manifest-reference-resolvers.util';
import {
  type WorkflowManualTrigger,
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

type WorkflowManifestReferenceResolvers = ReturnType<
  typeof buildWorkflowManifestReferenceResolvers
>;

type ManualTriggerManifest = Extract<
  WorkflowTriggerManifest,
  { type: 'MANUAL' }
>;

const fromManualTriggerManifest = ({
  trigger,
  resolvers,
}: {
  trigger: ManualTriggerManifest;
  resolvers: WorkflowManifestReferenceResolvers;
}): WorkflowManualTrigger => {
  const { settings, ...identity } = trigger;
  const availability = settings?.availability;
  const icon = settings?.icon;
  const isPinned = settings?.isPinned;

  return {
    ...identity,
    name: 'Manual trigger',
    type: WorkflowTriggerType.MANUAL,
    position: { x: 0, y: 0 },
    settings: {
      outputSchema: {},
      ...(isDefined(icon) ? { icon } : {}),
      ...(isDefined(isPinned) ? { isPinned } : {}),
      ...(isDefined(availability)
        ? {
            availability:
              availability.type === 'GLOBAL'
                ? { type: 'GLOBAL' as const }
                : {
                    type: availability.type,
                    objectNameSingular: resolvers.objectName(
                      availability.objectUniversalIdentifier,
                    ),
                  },
          }
        : {}),
    },
  } satisfies WorkflowManualTrigger;
};

export const fromWorkflowTriggerManifestToTriggerOrThrow = ({
  trigger,
  references,
}: {
  trigger: WorkflowTriggerManifest;
  references: WorkflowManifestReferences;
}): WorkflowTrigger => {
  const resolvers = buildWorkflowManifestReferenceResolvers({
    references,
    subject: 'Workflow trigger',
  });

  return fromManualTriggerManifest({ trigger, resolvers });
};
