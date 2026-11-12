import { isNonEmptyString } from '@sniptt/guards';
import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';
import { isPlainObject } from 'twenty-shared/utils';

// TODO: remove with the legacy databaseEventTriggerSettings / DATABASE_EVENT manifest form
export const getDatabaseEventTriggerSettingsErrors = ({
  settings,
  subject,
  eventNamePattern,
  replacement,
}: {
  settings: DatabaseEventTriggerSettings;
  subject: string;
  eventNamePattern?: RegExp;
  replacement: string;
}): string[] => {
  if (!isPlainObject(settings)) {
    return [`${subject} settings must be an object`];
  }

  if ('action' in settings) {
    return [`${subject}: declare an object and an action with ${replacement}`];
  }

  const { eventName } = settings;

  if (!isNonEmptyString(eventName)) {
    return [`${subject} must have an eventName`];
  }

  return eventNamePattern && !eventNamePattern.test(eventName)
    ? [`${subject} event name '${eventName}' must look like 'company.created'`]
    : [];
};
