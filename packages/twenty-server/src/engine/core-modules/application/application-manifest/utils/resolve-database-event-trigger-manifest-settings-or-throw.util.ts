import { msg } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import {
  type DatabaseEventTriggerManifestSettings,
  type DatabaseEventTriggerSettings,
  isObjectDatabaseEventTriggerManifestSettings,
} from 'twenty-shared/application';
import {
  compileValidationRuleExpression,
  isDefined,
} from 'twenty-shared/utils';

import { type DatabaseEventTriggerManifestResolver } from 'src/engine/core-modules/application/application-manifest/utils/build-database-event-trigger-manifest-resolver.util';
import { computeWorkflowWatchedFieldName } from 'src/engine/core-modules/application/application-manifest/utils/compute-workflow-watched-field-name.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { toDatabaseEventTriggerConditionField } from 'src/engine/workspace-event-emitter/utils/build-database-event-trigger-condition-fields.util';

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
  resolver,
  subject,
}: {
  condition: string;
  objectUniversalIdentifier: string | undefined;
  resolver: DatabaseEventTriggerManifestResolver;
  subject: string;
}) => {
  if (!isDefined(objectUniversalIdentifier)) {
    return throwInvalidTrigger({
      subject,
      reason: 'a condition needs a trigger on one object',
    });
  }

  const fields = resolver
    .listObjectFields(objectUniversalIdentifier)
    .map(toDatabaseEventTriggerConditionField)
    .filter(isDefined);
  const compilation = compileValidationRuleExpression({
    expression: condition,
    fields,
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
  resolver,
  subject,
}: {
  settings: DatabaseEventTriggerManifestSettings;
  resolver: DatabaseEventTriggerManifestResolver;
  subject: string;
}): DatabaseEventTriggerSettings => {
  const condition = readConditionOrThrow({
    condition: settings.condition,
    subject,
  });

  if (!isObjectDatabaseEventTriggerManifestSettings(settings)) {
    if (isDefined(condition)) {
      const [objectNameSingular] = settings.eventName.split('.');

      assertConditionCompilesOrThrow({
        condition,
        objectUniversalIdentifier:
          objectNameSingular === ANY_OBJECT
            ? undefined
            : resolver.findObjectUniversalIdentifierByNameSingular(
                objectNameSingular,
              ),
        resolver,
        subject,
      });
    }

    return settings;
  }

  const {
    objectUniversalIdentifier,
    action,
    fieldUniversalIdentifiers,
    batchMode,
  } = settings;

  const objectNameSingular = isDefined(objectUniversalIdentifier)
    ? resolver.findObjectNameSingular(objectUniversalIdentifier)
    : ANY_OBJECT;

  if (!isDefined(objectNameSingular)) {
    throwInvalidTrigger({
      subject,
      reason: `unknown object ${objectUniversalIdentifier}`,
    });
  }

  const updatedFields = fieldUniversalIdentifiers?.map(
    (fieldUniversalIdentifier) => {
      const field = resolver.findField(fieldUniversalIdentifier);

      if (
        !isDefined(field) ||
        field.objectUniversalIdentifier !== objectUniversalIdentifier
      ) {
        return throwInvalidTrigger({
          subject,
          reason: `field ${fieldUniversalIdentifier} is not on the trigger's object`,
        });
      }

      const watchedFieldName = computeWorkflowWatchedFieldName(field);

      return isDefined(watchedFieldName)
        ? watchedFieldName
        : throwInvalidTrigger({
            subject,
            reason: `${field.name} cannot be watched, only relations to a single record change on update`,
          });
    },
  );

  if (isDefined(condition)) {
    assertConditionCompilesOrThrow({
      condition,
      objectUniversalIdentifier,
      resolver,
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

export const toStoredDatabaseEventTriggerSettingsOrThrow = (
  settings: DatabaseEventTriggerManifestSettings,
): DatabaseEventTriggerSettings =>
  isObjectDatabaseEventTriggerManifestSettings(settings)
    ? throwInvalidTrigger({
        subject: 'Database event trigger',
        reason:
          'object and action settings must be resolved before they are stored',
      })
    : settings;
