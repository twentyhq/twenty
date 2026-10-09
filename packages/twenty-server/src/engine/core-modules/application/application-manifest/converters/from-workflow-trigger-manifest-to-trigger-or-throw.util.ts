import { msg } from '@lingui/core/macro';
import { type WorkflowTriggerManifest } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { buildWorkflowManifestReferenceResolvers } from 'src/engine/core-modules/application/application-manifest/utils/build-workflow-manifest-reference-resolvers.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type UpdateEventTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import {
  type WorkflowCronTrigger,
  type WorkflowDatabaseEventTrigger,
  type WorkflowManualTrigger,
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { computeCronPatternFromSchedule } from 'src/modules/workflow/workflow-trigger/utils/compute-cron-pattern-from-schedule';
import { assertNever } from 'src/utils/assert';

type WorkflowManifestReferenceResolvers = ReturnType<
  typeof buildWorkflowManifestReferenceResolvers
>;

type ManualTriggerManifest = Extract<
  WorkflowTriggerManifest,
  { type: 'MANUAL' }
>;

type CronTriggerManifest = Extract<WorkflowTriggerManifest, { type: 'CRON' }>;

type DatabaseEventTriggerManifest = Extract<
  WorkflowTriggerManifest,
  { type: 'DATABASE_EVENT' }
>;

const DATABASE_EVENT_TRIGGER_NAME_BY_ACTION: Record<
  DatabaseEventTriggerManifest['settings']['action'],
  string
> = {
  created: 'Record is created',
  updated: 'Record is updated',
  deleted: 'Record is deleted',
  upserted: 'Record is created or updated',
};

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

const fromCronTriggerManifestOrThrow = (
  trigger: CronTriggerManifest,
): WorkflowCronTrigger => {
  const { settings, ...identity } = trigger;
  const cronTrigger = {
    ...identity,
    name: 'On a schedule',
    type: WorkflowTriggerType.CRON,
    position: { x: 0, y: 0 },
    settings: { ...settings, outputSchema: {} },
  } satisfies WorkflowCronTrigger;

  try {
    computeCronPatternFromSchedule(cronTrigger);
  } catch (error) {
    throw new ApplicationException(
      `Workflow trigger: ${error instanceof Error ? error.message : String(error)}`,
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`The workflow schedule is invalid.`,
      },
    );
  }

  return cronTrigger;
};

const fromDatabaseEventTriggerManifest = ({
  trigger,
  resolvers,
}: {
  trigger: DatabaseEventTriggerManifest;
  resolvers: WorkflowManifestReferenceResolvers;
}): WorkflowDatabaseEventTrigger => {
  const { settings, ...identity } = trigger;

  const databaseEventSettings: WorkflowDatabaseEventTrigger['settings'] &
    Partial<UpdateEventTriggerSettings> = {
    eventName: `${resolvers.objectName(settings.objectUniversalIdentifier)}.${settings.action}`,
    outputSchema: {},
    ...(isNonEmptyArray(settings.fieldUniversalIdentifiers)
      ? {
          fields: settings.fieldUniversalIdentifiers.map(
            (fieldUniversalIdentifier) =>
              resolvers.field(
                fieldUniversalIdentifier,
                settings.objectUniversalIdentifier,
              ).name,
          ),
        }
      : {}),
    ...(isDefined(settings.filter)
      ? {
          filter: {
            stepFilterGroups: settings.filter.stepFilterGroups,
            stepFilters: settings.filter.stepFilters.map((stepFilter) =>
              resolvers.fieldReference(
                stepFilter,
                settings.objectUniversalIdentifier,
              ),
            ),
          },
        }
      : {}),
  };

  return {
    ...identity,
    name: DATABASE_EVENT_TRIGGER_NAME_BY_ACTION[settings.action],
    type: WorkflowTriggerType.DATABASE_EVENT,
    position: { x: 0, y: 0 },
    settings: databaseEventSettings,
  } satisfies WorkflowDatabaseEventTrigger;
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

  switch (trigger.type) {
    case 'MANUAL':
      return fromManualTriggerManifest({ trigger, resolvers });
    case 'CRON':
      return fromCronTriggerManifestOrThrow(trigger);
    case 'DATABASE_EVENT':
      return fromDatabaseEventTriggerManifest({ trigger, resolvers });
    default:
      return assertNever(trigger);
  }
};
