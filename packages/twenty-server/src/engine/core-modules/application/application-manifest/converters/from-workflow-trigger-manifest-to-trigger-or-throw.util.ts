import { msg } from '@lingui/core/macro';
import { type WorkflowTriggerManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  type WorkflowManualTrigger,
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

type ManualTriggerManifest = Extract<
  WorkflowTriggerManifest,
  { type: 'MANUAL' }
>;

type ManualTriggerManifestAvailability = NonNullable<
  NonNullable<ManualTriggerManifest['settings']>['availability']
>;

const resolveObjectNameSingularOrThrow = (
  objectUniversalIdentifier: string,
  references: WorkflowManifestReferences,
): string => {
  const object = references.objectByUniversalIdentifier?.get(
    objectUniversalIdentifier,
  );

  if (!isDefined(object)) {
    throw new ApplicationException(
      `Workflow trigger: missing object ${objectUniversalIdentifier}`,
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`The workflow references metadata that is not available to this application.`,
      },
    );
  }

  return object.nameSingular;
};

const fromManualTriggerAvailabilityManifest = (
  availability: ManualTriggerManifestAvailability,
  references: WorkflowManifestReferences,
): NonNullable<WorkflowManualTrigger['settings']['availability']> => {
  if (availability.type === 'GLOBAL') {
    return { type: 'GLOBAL' };
  }

  return {
    type: availability.type,
    objectNameSingular: resolveObjectNameSingularOrThrow(
      availability.objectUniversalIdentifier,
      references,
    ),
  };
};

export const fromWorkflowTriggerManifestToTriggerOrThrow = ({
  trigger,
  references,
}: {
  trigger: WorkflowTriggerManifest;
  references: WorkflowManifestReferences;
}): WorkflowTrigger => {
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
            availability: fromManualTriggerAvailabilityManifest(
              availability,
              references,
            ),
          }
        : {}),
    },
  } satisfies WorkflowManualTrigger;
};
