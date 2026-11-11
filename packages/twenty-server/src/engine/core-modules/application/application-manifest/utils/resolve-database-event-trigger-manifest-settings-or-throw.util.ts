import { msg } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import {
  type EventTriggerManifestSettings,
  type DatabaseEventTriggerSettings,
  isRecordEventTriggerManifestSettings,
} from 'twenty-shared/application';
import {
  compileValidationRuleExpression,
  isDefined,
} from 'twenty-shared/utils';

import { computeDatabaseEventWatchedFieldName } from 'src/engine/core-modules/application/application-manifest/utils/compute-database-event-watched-field-name.util';
import { type DatabaseEventTriggerManifestLookup } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-lookup.type';
import { findDatabaseEventTriggerManifestField } from 'src/engine/core-modules/application/application-manifest/utils/find-database-event-trigger-manifest-field.util';
import { findDatabaseEventTriggerManifestObjectNameSingular } from 'src/engine/core-modules/application/application-manifest/utils/find-database-event-trigger-manifest-object-name-singular.util';
import { findDatabaseEventTriggerManifestObjectUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/find-database-event-trigger-manifest-object-universal-identifier.util';
import { listDatabaseEventTriggerManifestConditionFields } from 'src/engine/core-modules/application/application-manifest/utils/list-database-event-trigger-manifest-condition-fields.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

const ANY_OBJECT = '*';

const throwInvalidTrigger = ({
  subject,
  reason,
}: {
  subject: string;
  reason: string;
}): never => {
  throw new ApplicationException(
    `${subject}: ${reason}`,
    ApplicationExceptionCode.INVALID_INPUT,
    {
      userFriendlyMessage: msg`A database event trigger in this application is invalid.`,
    },
  );
};

const assertConditionCompilesOrThrow = ({
  condition,
  objectUniversalIdentifier,
  lookup,
  subject,
}: {
  condition: string;
  objectUniversalIdentifier: string | undefined;
  lookup: DatabaseEventTriggerManifestLookup;
  subject: string;
}) => {
  if (!isDefined(objectUniversalIdentifier)) {
    return throwInvalidTrigger({
      subject,
      reason: 'a condition needs a trigger on one object',
    });
  }

  const compilation = compileValidationRuleExpression({
    expression: condition,
    fields: listDatabaseEventTriggerManifestConditionFields({
      lookup,
      objectUniversalIdentifier,
    }),
  });

  if (!compilation.isValid) {
    throwInvalidTrigger({
      subject,
      reason: `condition "${condition}" is invalid: ${compilation.errorMessage}`,
    });
  }
};

// Settings come from JavaScript apps too, where a condition may not be text
const readConditionOrThrow = ({
  condition,
  subject,
}: {
  condition: unknown;
  subject: string;
}): string | undefined => {
  if (!isDefined(condition) || condition === '') {
    return undefined;
  }

  return isString(condition)
    ? condition
    : throwInvalidTrigger({ subject, reason: 'the condition must be text' });
};

// Object and field universal identifiers become the event name and field names events carry
export const resolveDatabaseEventTriggerManifestSettingsOrThrow = ({
  settings,
  lookup,
  subject,
}: {
  settings: EventTriggerManifestSettings | DatabaseEventTriggerSettings;
  lookup: DatabaseEventTriggerManifestLookup;
  subject: string;
}): DatabaseEventTriggerSettings => {
  const condition = readConditionOrThrow({
    condition: settings.condition,
    subject,
  });

  if (!isRecordEventTriggerManifestSettings(settings)) {
    if (isDefined(condition)) {
      const [objectNameSingular] = settings.eventName.split('.');

      assertConditionCompilesOrThrow({
        condition,
        objectUniversalIdentifier:
          objectNameSingular === ANY_OBJECT
            ? undefined
            : findDatabaseEventTriggerManifestObjectUniversalIdentifier({
                lookup,
                objectNameSingular,
              }),
        lookup,
        subject,
      });
    }

    return settings;
  }

  const {
    objectUniversalIdentifier,
    action,
    watchedFieldUniversalIdentifiers,
    batchMode,
  } = settings;

  const objectNameSingular = isDefined(objectUniversalIdentifier)
    ? findDatabaseEventTriggerManifestObjectNameSingular({
        lookup,
        objectUniversalIdentifier,
      })
    : ANY_OBJECT;

  if (!isDefined(objectNameSingular)) {
    throwInvalidTrigger({
      subject,
      reason: `unknown object ${objectUniversalIdentifier}`,
    });
  }

  const updatedFields = watchedFieldUniversalIdentifiers?.map(
    (fieldUniversalIdentifier) => {
      const field = findDatabaseEventTriggerManifestField({
        lookup,
        fieldUniversalIdentifier,
      });

      if (
        !isDefined(field) ||
        field.objectUniversalIdentifier !== objectUniversalIdentifier
      ) {
        return throwInvalidTrigger({
          subject,
          reason: `field ${fieldUniversalIdentifier} is not on the trigger's object`,
        });
      }

      const watchedFieldName = computeDatabaseEventWatchedFieldName(field);

      return isDefined(watchedFieldName)
        ? watchedFieldName
        : throwInvalidTrigger({
            subject,
            reason: `${field.name} cannot be watched: only a relation to a single record, or one target of a morph relation, changes on update`,
          });
    },
  );

  if (isDefined(condition)) {
    assertConditionCompilesOrThrow({
      condition,
      objectUniversalIdentifier,
      lookup,
      subject,
    });
  }

  return {
    eventName: `${objectNameSingular}.${action}`,
    ...(isDefined(updatedFields) && { updatedFields }),
    ...(isDefined(condition) && { condition }),
    ...(isDefined(batchMode) && { batchMode }),
  };
};
