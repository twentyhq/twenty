import { type AppEventTriggerManifestSettings } from 'twenty-shared/application';
import { isPlainObject } from 'twenty-shared/utils';
import { validate as uuidValidate } from 'uuid';

export const getAppEventTriggerSettingsErrors = ({
  settings,
  subject,
}: {
  settings: AppEventTriggerManifestSettings;
  subject: string;
}): string[] => {
  if (!isPlainObject(settings)) {
    return [`${subject} settings must be an object`];
  }

  return uuidValidate(settings.eventUniversalIdentifier)
    ? []
    : [
        `${subject} eventUniversalIdentifier must be the universalIdentifier of an event the app declares`,
      ];
};
