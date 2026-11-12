import { msg } from '@lingui/core/macro';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { type ValidationRuleBindings } from 'twenty-shared/types';
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

type EventCondition = {
  eventName: string;
  condition: string;
  conditionBindings?: ValidationRuleBindings;
};

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

const readEventCondition = (trigger: unknown): EventCondition | undefined => {
  if (
    !isPlainObject(trigger) ||
    trigger.type !== 'DATABASE_EVENT' ||
    !isPlainObject(trigger.settings)
  ) {
    return undefined;
  }

  const { eventName, condition, conditionBindings } = trigger.settings;

  return isNonEmptyString(condition) && isString(eventName)
    ? {
        eventName,
        condition,
        ...(isPlainObject(conditionBindings) && {
          conditionBindings: conditionBindings as ValidationRuleBindings,
        }),
      }
    : undefined;
};

const toEventConditionKey = ({ eventName, condition }: EventCondition) =>
  JSON.stringify([eventName, condition]);

// Agent validation sees no object metadata, so conditions are compiled where agents are written
export const addAgentTriggerConditionBindingsOrThrow = <TTriggers>({
  triggers,
  storedTriggers,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  triggers: TTriggers;
  storedTriggers?: unknown;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): TTriggers => {
  if (!Array.isArray(triggers)) {
    return triggers;
  }

  const storedEventConditionsByKey = new Map(
    (Array.isArray(storedTriggers) ? storedTriggers : [])
      .map(readEventCondition)
      .filter(isDefined)
      .map((storedEventCondition) => [
        toEventConditionKey(storedEventCondition),
        storedEventCondition,
      ]),
  );

  const flatObjectMetadataByNameSingular = new Map(
    Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map((flatObjectMetadata) => [
        flatObjectMetadata.nameSingular,
        flatObjectMetadata,
      ]),
  );

  const compileOrThrow = ({
    eventName,
    condition,
  }: EventCondition): ValidationRuleBindings => {
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

    return compilation.bindings;
  };

  return triggers.map((trigger: unknown) => {
    const eventCondition = readEventCondition(trigger);

    if (
      !isDefined(eventCondition) ||
      !isPlainObject(trigger) ||
      !isPlainObject(trigger.settings)
    ) {
      return trigger;
    }

    const storedEventCondition = storedEventConditionsByKey.get(
      toEventConditionKey(eventCondition),
    );

    // A stored condition whose field was later deleted must not block unrelated edits
    const conditionBindings = isDefined(storedEventCondition)
      ? storedEventCondition.conditionBindings
      : compileOrThrow(eventCondition);

    return {
      ...trigger,
      settings: { ...trigger.settings, conditionBindings },
    };
  }) as TTriggers;
};
