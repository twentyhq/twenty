import { isNonEmptyString } from '@sniptt/guards';
import {
  type DatabaseEventTriggerManifestAction,
  type DatabaseEventTriggerManifestSettings,
  isObjectDatabaseEventTriggerManifestSettings,
} from 'twenty-shared/application';
import { validate as uuidValidate } from 'uuid';

const DATABASE_EVENT_TRIGGER_ACTIONS: DatabaseEventTriggerManifestAction[] = [
  'created',
  'updated',
  'deleted',
  'destroyed',
  'restored',
  'upserted',
  '*',
];

export const getDatabaseEventTriggerSettingsErrors = ({
  settings,
  subject,
  eventNamePattern,
  requiresObject = false,
}: {
  settings: DatabaseEventTriggerManifestSettings;
  subject: string;
  eventNamePattern?: RegExp;
  requiresObject?: boolean;
}): string[] => {
  if (!isObjectDatabaseEventTriggerManifestSettings(settings)) {
    const { eventName } = settings;

    if (!isNonEmptyString(eventName)) {
      return [`${subject} must have an action or an eventName`];
    }

    return eventNamePattern && !eventNamePattern.test(eventName)
      ? [
          `${subject} event name '${eventName}' must look like 'company.created'`,
        ]
      : [];
  }

  const errors: string[] = [];
  const {
    objectUniversalIdentifier,
    action,
    fieldUniversalIdentifiers,
    condition,
  } = settings;

  if (
    !DATABASE_EVENT_TRIGGER_ACTIONS.includes(action) ||
    (requiresObject && action === '*')
  ) {
    errors.push(
      `${subject} action '${action}' must be one of: ${DATABASE_EVENT_TRIGGER_ACTIONS.filter((validAction) => !requiresObject || validAction !== '*').join(', ')}`,
    );
  }

  if (isNonEmptyString(objectUniversalIdentifier)) {
    if (!uuidValidate(objectUniversalIdentifier)) {
      errors.push(`${subject} objectUniversalIdentifier must be a valid UUID`);
    }
  } else if (
    requiresObject ||
    isNonEmptyString(condition) ||
    (fieldUniversalIdentifiers?.length ?? 0) > 0
  ) {
    errors.push(
      `${subject} needs an objectUniversalIdentifier to watch fields or check a condition`,
    );
  }

  if (
    fieldUniversalIdentifiers?.some(
      (fieldUniversalIdentifier) => !uuidValidate(fieldUniversalIdentifier),
    )
  ) {
    errors.push(`${subject} fieldUniversalIdentifiers must be valid UUIDs`);
  }

  return errors;
};
