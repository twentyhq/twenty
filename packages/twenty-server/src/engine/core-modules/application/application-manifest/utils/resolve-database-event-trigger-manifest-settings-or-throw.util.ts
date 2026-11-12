import { msg } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import {
  type EventTriggerManifestSettings,
  type DatabaseEventTriggerSettings,
  isRecordEventTriggerManifestSettings,
} from 'twenty-shared/application';
import { type ValidationRuleBindings } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  isDefined,
} from 'twenty-shared/utils';

import { type DatabaseEventTriggerManifestLookup } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-lookup.type';
import { computeWorkflowWatchedFieldName } from 'src/engine/core-modules/application/application-manifest/utils/compute-workflow-watched-field-name.util';
import { findDatabaseEventTriggerManifestField } from 'src/engine/core-modules/application/application-manifest/utils/find-database-event-trigger-manifest-field.util';
import { findDatabaseEventTriggerManifestObjectNameSingular } from 'src/engine/core-modules/application/application-manifest/utils/find-database-event-trigger-manifest-object-name-singular.util';
import { findDatabaseEventTriggerManifestObjectUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/find-database-event-trigger-manifest-object-universal-identifier.util';
import { listDatabaseEventTriggerManifestObjectFields } from 'src/engine/core-modules/application/application-manifest/utils/list-database-event-trigger-manifest-object-fields.util';
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

const compileConditionOrThrow = ({
  condition,
  objectUniversalIdentifier,
  lookup,
  subject,
}: {
  condition: string;
  objectUniversalIdentifier: string | undefined;
  lookup: DatabaseEventTriggerManifestLookup;
  subject: string;
}): ValidationRuleBindings => {
  if (!isDefined(objectUniversalIdentifier)) {
    return throwInvalidTrigger({
      subject,
      reason: 'a condition needs a trigger on one object',
    });
  }

  const fields = listDatabaseEventTriggerManifestObjectFields({
    lookup,
    objectUniversalIdentifier,
  })
    .map(toDatabaseEventTriggerConditionField)
    .filter(isDefined);
  const compilation = compileValidationRuleExpression({
    expression: condition,
    fields,
  });

  return compilation.isValid
    ? compilation.bindings
    : throwInvalidTrigger({
        subject,
        reason: `condition "${condition}" is invalid: ${compilation.errorMessage}`,
      });
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
    const { conditionBindings: _conditionBindings, ...legacySettings } =
      settings;

    if (!isDefined(condition)) {
      return legacySettings;
    }

    const [objectNameSingular] = settings.eventName.split('.');

    return {
      ...legacySettings,
      conditionBindings: compileConditionOrThrow({
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
      }),
    };
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

      const watchedFieldName = computeWorkflowWatchedFieldName(field);

      return isDefined(watchedFieldName)
        ? watchedFieldName
        : throwInvalidTrigger({
            subject,
            reason: `${field.name} cannot be watched, only relations to a single record change on update`,
          });
    },
  );

  return {
    eventName: `${objectNameSingular}.${action}`,
    ...(isDefined(updatedFields) && { updatedFields }),
    ...(isDefined(condition) && {
      condition,
      conditionBindings: compileConditionOrThrow({
        condition,
        objectUniversalIdentifier,
        lookup,
        subject,
      }),
    }),
    ...(isDefined(batchMode) && { batchMode }),
  };
};
