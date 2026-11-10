import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
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

const throwInvalidTrigger = (subject: string, reason: string): never => {
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
    throwInvalidTrigger(subject, 'a condition needs a trigger on one object');
  }

  const fields = resolver
    .listObjectFields(objectUniversalIdentifier as string)
    .map(toDatabaseEventTriggerConditionField)
    .filter(isDefined);
  const compilation = compileValidationRuleExpression({
    expression: condition,
    fields,
  });

  if (!compilation.isValid) {
    throwInvalidTrigger(
      subject,
      `condition "${condition}" is invalid: ${compilation.errorMessage}`,
    );
  }
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
  if (!isObjectDatabaseEventTriggerManifestSettings(settings)) {
    if (isNonEmptyString(settings.condition)) {
      const [objectNameSingular] = settings.eventName.split('.');

      assertConditionCompilesOrThrow({
        condition: settings.condition,
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
    condition,
    batchMode,
  } = settings;

  const objectNameSingular = isDefined(objectUniversalIdentifier)
    ? resolver.findObjectNameSingular(objectUniversalIdentifier)
    : ANY_OBJECT;

  if (!isDefined(objectNameSingular)) {
    throwInvalidTrigger(subject, `unknown object ${objectUniversalIdentifier}`);
  }

  const updatedFields = fieldUniversalIdentifiers?.map(
    (fieldUniversalIdentifier) => {
      const field = resolver.findField(fieldUniversalIdentifier);

      if (
        !isDefined(field) ||
        field.objectUniversalIdentifier !== objectUniversalIdentifier
      ) {
        return throwInvalidTrigger(
          subject,
          `field ${fieldUniversalIdentifier} is not on the trigger's object`,
        );
      }

      const watchedFieldName = computeWorkflowWatchedFieldName(field);

      return isDefined(watchedFieldName)
        ? watchedFieldName
        : throwInvalidTrigger(
            subject,
            `${field.name} cannot be watched, only relations to a single record change on update`,
          );
    },
  );

  if (isNonEmptyString(condition)) {
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
    ...(isNonEmptyString(condition) && { condition }),
    ...(isDefined(batchMode) && { batchMode }),
  };
};

// Only resolved settings are stored; converters reached without a resolver get those
export const toStoredDatabaseEventTriggerSettingsOrThrow = (
  settings: DatabaseEventTriggerManifestSettings,
): DatabaseEventTriggerSettings =>
  isObjectDatabaseEventTriggerManifestSettings(settings)
    ? throwInvalidTrigger(
        'Database event trigger',
        'object and action settings must be resolved before they are stored',
      )
    : settings;
