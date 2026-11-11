import { msg } from '@lingui/core/macro';
import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  compileValidationRuleExpression,
  isDefined,
  isPlainObject,
} from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildDatabaseEventTriggerConditionFields } from 'src/engine/workspace-event-emitter/utils/build-database-event-trigger-condition-fields.util';

const buildInvalidConditionException = ({
  condition,
  reason,
}: {
  condition: string;
  reason: string;
}) =>
  new AiException(
    `Condition "${condition}" of an agent trigger is invalid: ${reason}`,
    AiExceptionCode.INVALID_AGENT_INPUT,
    {
      userFriendlyMessage: msg`The condition of an agent trigger is invalid`,
    },
  );

const readEventCondition = (
  trigger: unknown,
): { eventName: string; condition: string } | undefined => {
  if (
    !isPlainObject(trigger) ||
    trigger.type !== 'DATABASE_EVENT' ||
    !isPlainObject(trigger.settings)
  ) {
    return undefined;
  }

  const { eventName, condition } = trigger.settings;

  return isNonEmptyString(condition) && isString(eventName)
    ? { eventName, condition }
    : undefined;
};

const toEventConditionKey = ({
  eventName,
  condition,
}: {
  eventName: string;
  condition: string;
}) => JSON.stringify([eventName, condition]);

// Agent validation sees no object metadata, so conditions are compiled where agents are written
export const assertAgentTriggerConditionsCompileOrThrow = ({
  triggers,
  storedTriggers,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  triggers: unknown;
  storedTriggers?: unknown;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}) => {
  if (!Array.isArray(triggers)) {
    return;
  }

  // A stored condition whose field was later deleted must not block unrelated edits
  const storedEventConditionKeys = new Set(
    (Array.isArray(storedTriggers) ? storedTriggers : [])
      .map(readEventCondition)
      .filter(isDefined)
      .map(toEventConditionKey),
  );

  const flatObjectMetadataByNameSingular = new Map(
    Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map((flatObjectMetadata) => [
        flatObjectMetadata.nameSingular,
        flatObjectMetadata,
      ]),
  );

  for (const trigger of triggers) {
    const eventCondition = readEventCondition(trigger);

    if (
      !isDefined(eventCondition) ||
      storedEventConditionKeys.has(toEventConditionKey(eventCondition))
    ) {
      continue;
    }

    const { eventName, condition } = eventCondition;

    const [objectNameSingular] = eventName.split('.');
    const flatObjectMetadata =
      flatObjectMetadataByNameSingular.get(objectNameSingular);

    if (!isDefined(flatObjectMetadata)) {
      throw buildInvalidConditionException({
        condition,
        reason: `Unknown object ${objectNameSingular}`,
      });
    }

    const compilation = compileValidationRuleExpression({
      expression: condition,
      fields: buildDatabaseEventTriggerConditionFields({
        flatObjectMetadata,
        flatFieldMetadataMaps,
      }),
    });

    if (!compilation.isValid) {
      throw buildInvalidConditionException({
        condition,
        reason: compilation.errorMessage,
      });
    }
  }
};
