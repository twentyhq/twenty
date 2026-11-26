import { type AgentTrigger } from 'twenty-shared/application';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { printDatabaseEventTriggerSettings } from 'src/engine/workspace-event-emitter/utils/print-database-event-trigger-settings.util';

export const printAgentTriggers = ({
  triggers,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  triggers: AgentTrigger[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): AgentTrigger[] =>
  triggers.map((trigger) =>
    trigger.type === 'DATABASE_EVENT'
      ? {
          ...trigger,
          settings: printDatabaseEventTriggerSettings({
            settings: trigger.settings,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          }),
        }
      : trigger,
  );
