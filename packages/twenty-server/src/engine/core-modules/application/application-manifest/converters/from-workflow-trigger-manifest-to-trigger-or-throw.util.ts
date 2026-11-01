import { msg } from '@lingui/core/macro';
import { type WorkflowTriggerManifest } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  type WorkflowManifestFieldReference,
  type WorkflowManifestReferences,
} from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import {
  computeWorkflowTriggerManifestDefaults,
  DEFAULT_WORKFLOW_TRIGGER_POSITION,
} from 'src/engine/core-modules/application/application-manifest/utils/compute-workflow-trigger-manifest-defaults.util';
import { computeWorkflowWatchedFieldName } from 'src/engine/core-modules/application/application-manifest/utils/compute-workflow-watched-field-name.util';
import { buildWorkflowManifestReferenceResolvers } from 'src/engine/core-modules/application/application-manifest/utils/build-workflow-manifest-reference-resolvers.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { type UpdateEventTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import {
  type WorkflowCronTrigger,
  type WorkflowDatabaseEventTrigger,
  type WorkflowManualTrigger,
  type WorkflowTrigger,
  WorkflowTriggerType,
  type WorkflowWebhookTrigger,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { computeCronPatternFromSchedule } from 'src/modules/workflow/workflow-trigger/utils/compute-cron-pattern-from-schedule';
import { computeEventName } from 'src/engine/workspace-event-emitter/utils/compute-event-name';
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

type WebhookTriggerManifest = Extract<
  WorkflowTriggerManifest,
  { type: 'WEBHOOK' }
>;

type TriggerBase = Pick<
  WorkflowTrigger,
  'name' | 'nextStepIds' | 'position'
> & { universalIdentifier?: string };

const fromTriggerManifestBase = (
  trigger: WorkflowTriggerManifest,
): { base: TriggerBase; outputSchema: OutputSchema } => {
  const defaults = computeWorkflowTriggerManifestDefaults(trigger);
  const { universalIdentifier, name, nextStepIds, position } = trigger;

  return {
    base: {
      ...(isDefined(universalIdentifier) ? { universalIdentifier } : {}),
      name: name ?? defaults.name,
      nextStepIds,
      ...(position === null
        ? {}
        : { position: position ?? DEFAULT_WORKFLOW_TRIGGER_POSITION }),
    },
    outputSchema: (trigger.outputSchema ??
      defaults.outputSchema) as OutputSchema,
  };
};

const fromManualTriggerManifestOrThrow = ({
  trigger,
  resolvers,
}: {
  trigger: ManualTriggerManifest;
  resolvers: WorkflowManifestReferenceResolvers;
}): WorkflowManualTrigger => {
  const { settings } = trigger;
  const { base, outputSchema } = fromTriggerManifestBase(trigger);
  const availability = settings?.availability;
  const icon = settings?.icon;
  const isPinned = settings?.isPinned;

  return {
    ...base,
    type: WorkflowTriggerType.MANUAL,
    settings: {
      outputSchema,
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
  const { base, outputSchema } = fromTriggerManifestBase(trigger);
  const cronTrigger = {
    ...base,
    type: WorkflowTriggerType.CRON,
    settings: { ...trigger.settings, outputSchema },
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

const toWatchedFieldNameOrThrow = (
  field: WorkflowManifestFieldReference,
): string => {
  const watchedFieldName = computeWorkflowWatchedFieldName(field);

  if (!isDefined(watchedFieldName)) {
    throw new ApplicationException(
      `Workflow trigger: ${field.name} cannot be watched, only relations to a single record change on update`,
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`A record event can only watch relations that point to a single record.`,
      },
    );
  }

  return watchedFieldName;
};

const fromDatabaseEventTriggerManifestOrThrow = ({
  trigger,
  resolvers,
}: {
  trigger: DatabaseEventTriggerManifest;
  resolvers: WorkflowManifestReferenceResolvers;
}): WorkflowDatabaseEventTrigger => {
  const { settings } = trigger;
  const { base, outputSchema } = fromTriggerManifestBase(trigger);

  const databaseEventSettings: WorkflowDatabaseEventTrigger['settings'] &
    Partial<UpdateEventTriggerSettings> = {
    eventName: computeEventName(
      resolvers.objectName(settings.objectUniversalIdentifier),
      settings.action,
    ),
    outputSchema,
    ...(isNonEmptyArray(settings.fieldUniversalIdentifiers)
      ? {
          fields: settings.fieldUniversalIdentifiers.map(
            (fieldUniversalIdentifier) =>
              toWatchedFieldNameOrThrow(
                resolvers.field(
                  fieldUniversalIdentifier,
                  settings.objectUniversalIdentifier,
                ),
              ),
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
    ...base,
    type: WorkflowTriggerType.DATABASE_EVENT,
    settings: databaseEventSettings,
  } satisfies WorkflowDatabaseEventTrigger;
};

const fromWebhookTriggerManifestSettings = ({
  settings,
  outputSchema,
}: {
  settings: WebhookTriggerManifest['settings'];
  outputSchema: OutputSchema;
}): WorkflowWebhookTrigger['settings'] => {
  if (settings.httpMethod === 'GET') {
    return { httpMethod: 'GET', authentication: null, outputSchema };
  }

  return {
    httpMethod: 'POST',
    authentication: null,
    expectedBody: settings.expectedBody,
    expectedOutputSchema: settings.expectedBody,
    outputSchema,
  };
};

const fromWebhookTriggerManifest = (
  trigger: WebhookTriggerManifest,
): WorkflowWebhookTrigger => {
  const { settings } = trigger;
  const { base, outputSchema } = fromTriggerManifestBase(trigger);

  return {
    ...base,
    type: WorkflowTriggerType.WEBHOOK,
    settings: fromWebhookTriggerManifestSettings({ settings, outputSchema }),
  } satisfies WorkflowWebhookTrigger;
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
      return fromManualTriggerManifestOrThrow({ trigger, resolvers });
    case 'CRON':
      return fromCronTriggerManifestOrThrow(trigger);
    case 'DATABASE_EVENT':
      return fromDatabaseEventTriggerManifestOrThrow({ trigger, resolvers });
    case 'WEBHOOK':
      return fromWebhookTriggerManifest(trigger);
    default:
      return assertNever(trigger);
  }
};
