import { isBoolean, isNonEmptyString, isString } from '@sniptt/guards';
import {
  type RecordEventTriggerManifestAction,
  type RecordEventTriggerManifestSettings,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';
import { validate as uuidValidate } from 'uuid';

const RECORD_EVENT_TRIGGER_ACTIONS: RecordEventTriggerManifestAction[] = [
  'created',
  'updated',
  'deleted',
  'destroyed',
  'restored',
  'upserted',
  '*',
];

export const getRecordEventTriggerSettingsErrors = ({
  settings,
  subject,
  isObjectRequired = false,
}: {
  settings: RecordEventTriggerManifestSettings;
  subject: string;
  isObjectRequired?: boolean;
}): string[] => {
  if (!isPlainObject(settings)) {
    return [`${subject} settings must be an object`];
  }

  if (settings.on !== 'recordEvent') {
    return [`${subject} settings must set on: 'recordEvent'`];
  }

  const errors: string[] = [];
  const {
    objectUniversalIdentifier,
    action,
    watchedFieldUniversalIdentifiers,
    condition,
    batchMode,
  } = settings;

  if (
    !RECORD_EVENT_TRIGGER_ACTIONS.includes(action) ||
    (isObjectRequired && action === '*')
  ) {
    errors.push(
      `${subject} action '${action}' must be one of: ${RECORD_EVENT_TRIGGER_ACTIONS.filter((validAction) => !isObjectRequired || validAction !== '*').join(', ')}`,
    );
  }

  if (
    isDefined(objectUniversalIdentifier) &&
    !uuidValidate(objectUniversalIdentifier)
  ) {
    errors.push(`${subject} objectUniversalIdentifier must be a valid UUID`);
  }

  if (
    !isNonEmptyString(objectUniversalIdentifier) &&
    (isObjectRequired ||
      isNonEmptyString(condition) ||
      isNonEmptyArray(watchedFieldUniversalIdentifiers))
  ) {
    errors.push(
      `${subject} needs an objectUniversalIdentifier to watch fields or check a condition`,
    );
  }

  if (
    isDefined(watchedFieldUniversalIdentifiers) &&
    (!Array.isArray(watchedFieldUniversalIdentifiers) ||
      watchedFieldUniversalIdentifiers.some(
        (fieldUniversalIdentifier) => !uuidValidate(fieldUniversalIdentifier),
      ))
  ) {
    errors.push(
      `${subject} watchedFieldUniversalIdentifiers must be a list of valid UUIDs`,
    );
  }

  if (
    isNonEmptyArray(watchedFieldUniversalIdentifiers) &&
    action !== 'updated' &&
    action !== 'upserted'
  ) {
    errors.push(
      `${subject} watchedFieldUniversalIdentifiers only apply to the updated and upserted actions`,
    );
  }

  if (isDefined(condition) && !isString(condition)) {
    errors.push(`${subject} condition must be text`);
  }

  if (isDefined(batchMode) && !isBoolean(batchMode)) {
    errors.push(`${subject} batchMode must be true or false`);
  }

  return errors;
};
