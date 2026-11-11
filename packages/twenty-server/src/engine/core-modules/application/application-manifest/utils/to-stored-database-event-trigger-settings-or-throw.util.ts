import { msg } from '@lingui/core/macro';
import {
  type DatabaseEventTriggerManifestSettings,
  type DatabaseEventTriggerSettings,
  isObjectDatabaseEventTriggerManifestSettings,
} from 'twenty-shared/application';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const toStoredDatabaseEventTriggerSettingsOrThrow = (
  settings: DatabaseEventTriggerManifestSettings,
): DatabaseEventTriggerSettings => {
  if (isObjectDatabaseEventTriggerManifestSettings(settings)) {
    throw new ApplicationException(
      'Database event trigger: object and action settings must be resolved before they are stored',
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`A database event trigger in this application is invalid.`,
      },
    );
  }

  return settings;
};
