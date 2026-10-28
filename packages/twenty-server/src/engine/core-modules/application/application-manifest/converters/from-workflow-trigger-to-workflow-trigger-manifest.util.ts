import { type WorkflowTriggerManifest } from 'twenty-shared/application';
import {
  isDefined,
  isNonEmptyArray,
  sortKeysDeeply,
} from 'twenty-shared/utils';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { buildWorkflowManifestInverseReferenceResolvers } from 'src/engine/core-modules/application/application-manifest/utils/build-workflow-manifest-inverse-reference-resolvers.util';
import { type UpdateEventTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import {
  type WorkflowCronTrigger,
  type WorkflowDatabaseEventTrigger,
  type WorkflowManualTrigger,
  type WorkflowTrigger,
  WorkflowTriggerType,
  type WorkflowWebhookTrigger,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

type WorkflowManifestInverseReferenceResolvers = ReturnType<
  typeof buildWorkflowManifestInverseReferenceResolvers
>;

const fromManualTriggerAvailability = ({
  availability,
  resolvers,
}: {
  availability: NonNullable<WorkflowManualTrigger['settings']['availability']>;
  resolvers: WorkflowManifestInverseReferenceResolvers;
}) => {
  if (availability.type === 'GLOBAL') {
    return { type: availability.type };
  }

  return {
    type: availability.type,
    objectUniversalIdentifier: resolvers.objectUniversalIdentifier(
      availability.objectNameSingular,
    ),
  };
};

const fromManualTriggerSettings = ({
  settings,
  resolvers,
}: {
  settings: WorkflowManualTrigger['settings'];
  resolvers: WorkflowManifestInverseReferenceResolvers;
}) => {
  const { availability, icon, isPinned } = settings;

  if (!isDefined(availability) && !isDefined(icon) && !isDefined(isPinned)) {
    return undefined;
  }

  if (
    isDefined(availability) &&
    'locations' in availability &&
    isDefined(availability.locations)
  ) {
    resolvers.markUnsupported('manual trigger available in specific locations');
  }

  return {
    ...(isDefined(availability)
      ? {
          availability: fromManualTriggerAvailability({
            availability,
            resolvers,
          }),
        }
      : {}),
    ...(isDefined(icon) ? { icon } : {}),
    ...(isDefined(isPinned) ? { isPinned } : {}),
  };
};

const fromCronTriggerSettings = (settings: WorkflowCronTrigger['settings']) => {
  const { outputSchema: _outputSchema, ...rest } = settings;

  return rest;
};

const fromDatabaseEventTriggerSettings = ({
  settings,
  resolvers,
}: {
  settings: WorkflowDatabaseEventTrigger['settings'] &
    Partial<UpdateEventTriggerSettings>;
  resolvers: WorkflowManifestInverseReferenceResolvers;
}) => {
  const [objectName, action, ...extraSegments] = settings.eventName.split('.');

  if (extraSegments.length > 0 || !isDefined(action)) {
    resolvers.markUnsupported('record event trigger on an unknown event');
  }

  const objectUniversalIdentifier =
    resolvers.objectUniversalIdentifier(objectName);
  const { fields, filter } = settings;

  return {
    objectUniversalIdentifier,
    action,
    ...(isNonEmptyArray(fields)
      ? {
          fieldUniversalIdentifiers: fields.map((watchedFieldName) =>
            resolvers.watchedFieldUniversalIdentifier({
              objectUniversalIdentifier,
              watchedFieldName,
            }),
          ),
        }
      : {}),
    ...(isDefined(filter)
      ? {
          filter: {
            stepFilterGroups: filter.stepFilterGroups,
            stepFilters: filter.stepFilters.map(resolvers.fieldReference),
          },
        }
      : {}),
  };
};

const fromWebhookTriggerSettings = ({
  settings,
  resolvers,
}: {
  settings: WorkflowWebhookTrigger['settings'];
  resolvers: WorkflowManifestInverseReferenceResolvers;
}) => {
  if (isDefined(settings.authentication)) {
    resolvers.markUnsupported('webhook trigger with authentication');
  }

  return settings.httpMethod === 'GET'
    ? { httpMethod: settings.httpMethod }
    : { httpMethod: settings.httpMethod, expectedBody: settings.expectedBody };
};

const fromTriggerSettings = ({
  trigger,
  resolvers,
}: {
  trigger: WorkflowTrigger;
  resolvers: WorkflowManifestInverseReferenceResolvers;
}): unknown => {
  const triggerType: string = trigger.type;

  switch (trigger.type) {
    case WorkflowTriggerType.MANUAL:
      return fromManualTriggerSettings({
        settings: trigger.settings,
        resolvers,
      });
    case WorkflowTriggerType.CRON:
      return fromCronTriggerSettings(trigger.settings);
    case WorkflowTriggerType.DATABASE_EVENT:
      return fromDatabaseEventTriggerSettings({
        settings: trigger.settings,
        resolvers,
      });
    case WorkflowTriggerType.WEBHOOK:
      return fromWebhookTriggerSettings({
        settings: trigger.settings,
        resolvers,
      });
    default:
      return resolvers.markUnsupported(
        `${triggerType} triggers are not supported in application workflows`,
      );
  }
};

export const fromWorkflowTriggerToWorkflowTriggerManifest = ({
  trigger,
  references,
}: {
  trigger: WorkflowTrigger & { universalIdentifier?: string };
  references: WorkflowManifestReferences;
}): { manifest: WorkflowTriggerManifest } | { reason: string } => {
  if (!isDefined(trigger.universalIdentifier)) {
    return { reason: 'workflow trigger without a universal identifier' };
  }

  const resolvers = buildWorkflowManifestInverseReferenceResolvers(references);
  const settings = fromTriggerSettings({ trigger, resolvers });
  const unsupportedReason = resolvers.getUnsupportedReason();

  if (isDefined(unsupportedReason)) {
    return { reason: unsupportedReason };
  }

  return {
    manifest: {
      universalIdentifier: trigger.universalIdentifier,
      type: trigger.type,
      nextStepIds: trigger.nextStepIds ?? [],
      ...(isDefined(settings) ? { settings: sortKeysDeeply(settings) } : {}),
    } as WorkflowTriggerManifest,
  };
};
