import { msg } from '@lingui/core/macro';
import {
  type DatabaseEventTriggerSettings,
  type RecordEventTriggerManifestSettings,
  isRecordEventTriggerManifestSettings,
} from 'twenty-shared/application';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const toStoredDatabaseEventTriggerSettingsOrThrow = (
  settings: RecordEventTriggerManifestSettings | DatabaseEventTriggerSettings,
): DatabaseEventTriggerSettings => {
  if (isRecordEventTriggerManifestSettings(settings)) {
    throw new ApplicationException(
      'Event trigger: record settings must be resolved before they are stored',
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`A database event trigger in this application is invalid.`,
      },
    );
  }

  return settings;
};
