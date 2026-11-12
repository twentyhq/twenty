import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type AgentDatabaseEventTrigger,
  type AgentTrigger,
} from 'twenty-shared/application';
import { type ValidationRuleBindings } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  isDefined,
} from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';

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

const toEventConditionKey = ({
  eventName,
  condition,
}: Pick<AgentDatabaseEventTrigger['settings'], 'eventName' | 'condition'>) =>
  JSON.stringify([eventName, condition]);

// Agent validation sees no object metadata, so conditions are compiled where agents are written
export const addAgentTriggerConditionBindingsOrThrow = ({
  triggers,
  storedTriggers = [],
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  triggers: AgentTrigger[] | undefined;
  storedTriggers?: AgentTrigger[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): AgentTrigger[] | undefined => {
  if (!isDefined(triggers)) {
    return triggers;
  }

  const storedBindingsByEventConditionKey = new Map(
    storedTriggers
      .filter(
        (storedTrigger): storedTrigger is AgentDatabaseEventTrigger =>
          storedTrigger.type === 'DATABASE_EVENT',
      )
      .map(({ settings }) => [
        toEventConditionKey(settings),
        settings.conditionBindings,
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
  }: {
    eventName: string;
    condition: string;
  }): ValidationRuleBindings => {
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
      fields: buildValidationRuleFieldDescriptors({
        objectMetadataId: flatObjectMetadata.id,
        flatObjectMetadataMaps,
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

  return triggers.map((trigger) => {
    if (
      trigger.type !== 'DATABASE_EVENT' ||
      !isNonEmptyString(trigger.settings.condition)
    ) {
      return trigger;
    }

    const eventConditionKey = toEventConditionKey(trigger.settings);

    // A stored condition whose field was later deleted must not block unrelated edits
    const conditionBindings = storedBindingsByEventConditionKey.has(
      eventConditionKey,
    )
      ? storedBindingsByEventConditionKey.get(eventConditionKey)
      : compileOrThrow({
          eventName: trigger.settings.eventName,
          condition: trigger.settings.condition,
        });

    return {
      ...trigger,
      settings: { ...trigger.settings, conditionBindings },
    };
  });
};
