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

// Agent validation sees no object metadata, so conditions are compiled where agents are written
export const assertAgentTriggerConditionsCompileOrThrow = ({
  triggers,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  triggers: unknown;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}) => {
  if (!Array.isArray(triggers)) {
    return;
  }

  const flatObjectMetadataByNameSingular = new Map(
    Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map((flatObjectMetadata) => [
        flatObjectMetadata.nameSingular,
        flatObjectMetadata,
      ]),
  );

  for (const trigger of triggers) {
    if (
      !isPlainObject(trigger) ||
      trigger.type !== 'DATABASE_EVENT' ||
      !isPlainObject(trigger.settings)
    ) {
      continue;
    }

    const { eventName, condition } = trigger.settings;

    if (!isNonEmptyString(condition) || !isString(eventName)) {
      continue;
    }

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
  }
};
