import { isNonEmptyString } from '@sniptt/guards';
import {
  type DatabaseEventTriggerManifestAction,
  type DatabaseEventTriggerManifestSettings,
  isObjectDatabaseEventTriggerManifestSettings,
} from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';
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
  isObjectRequired = false,
}: {
  settings: DatabaseEventTriggerManifestSettings;
  subject: string;
  eventNamePattern?: RegExp;
  isObjectRequired?: boolean;
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
    (isObjectRequired && action === '*')
  ) {
    errors.push(
      `${subject} action '${action}' must be one of: ${DATABASE_EVENT_TRIGGER_ACTIONS.filter((validAction) => !isObjectRequired || validAction !== '*').join(', ')}`,
    );
  }

  if (isNonEmptyString(objectUniversalIdentifier)) {
    if (!uuidValidate(objectUniversalIdentifier)) {
      errors.push(`${subject} objectUniversalIdentifier must be a valid UUID`);
    }
  } else if (
    isObjectRequired ||
    isNonEmptyString(condition) ||
    isNonEmptyArray(fieldUniversalIdentifiers)
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
