import { msg } from '@lingui/core/macro';
import {
  type AgentDatabaseEventTrigger,
  type AgentTrigger,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeDatabaseEventTriggerSettingsOrThrow } from 'src/engine/workspace-event-emitter/utils/compute-database-event-trigger-settings-or-throw.util';

const throwInvalidCondition = ({
  condition,
  reason,
}: {
  condition: string;
  reason: string;
}): never => {
  throw new AiException(
    `Condition "${condition}" of an agent trigger is invalid: ${reason}`,
    AiExceptionCode.INVALID_AGENT_INPUT,
    {
      userFriendlyMessage: msg`The condition of an agent trigger is invalid`,
    },
  );
};

export const addAgentTriggerConditionTreesOrThrow = ({
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

  const storedSettings = storedTriggers
    .filter(
      (storedTrigger): storedTrigger is AgentDatabaseEventTrigger =>
        storedTrigger.type === 'DATABASE_EVENT',
    )
    .map(({ settings }) => settings);

  return triggers.map((trigger) =>
    trigger.type === 'DATABASE_EVENT'
      ? {
          ...trigger,
          settings: computeDatabaseEventTriggerSettingsOrThrow({
            settings: trigger.settings,
            storedSettings,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            throwInvalidCondition,
          }),
        }
      : trigger,
  );
};
