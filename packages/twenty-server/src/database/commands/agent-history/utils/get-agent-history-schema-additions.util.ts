import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

type AgentHistorySchemaMaps = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatIndexMaps'
>;

export const getAgentHistorySchemaAdditions = ({
  existing,
  standard,
}: {
  existing: AgentHistorySchemaMaps;
  standard: AgentHistorySchemaMaps;
}) => {
  const objectIdentifiers = new Set<string>(
    AGENT_HISTORY_TABLES.map(
      ({ name }) => STANDARD_OBJECTS[name].universalIdentifier,
    ),
  );
  for (const identifier of objectIdentifiers) {
    const current =
      existing.flatObjectMetadataMaps.byUniversalIdentifier[identifier];
    const expected =
      standard.flatObjectMetadataMaps.byUniversalIdentifier[identifier];
    const hasValidProtection =
      isDefined(current) &&
      ((current.readability === MetadataReadability.SYSTEM &&
        current.writability === MetadataWritability.SYSTEM) ||
        (identifier === STANDARD_OBJECTS.agentChatThread.universalIdentifier &&
          current.readability === MetadataReadability.PRIVATE &&
          current.writability === MetadataWritability.OPEN));
    if (
      isDefined(current) &&
      (current.nameSingular !== expected?.nameSingular ||
        !hasValidProtection ||
        current.isSearchable ||
        current.isAuditLogged)
    ) {
      throw new Error(
        'Agent history object protections have drifted; repair metadata before migrating',
      );
    }
  }
  const objects = Object.values(
    standard.flatObjectMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (object) =>
        objectIdentifiers.has(object.universalIdentifier) &&
        !isDefined(
          existing.flatObjectMetadataMaps.byUniversalIdentifier[
            object.universalIdentifier
          ],
        ),
    );
  // Preparation can run before history is copied and ownership is backfilled.
  // Keep newly provisioned legacy objects protected until the sharing upgrade.
  const protectedObjects: typeof objects = objects.map((object) => ({
    ...object,
    readability: MetadataReadability.SYSTEM,
    writability: MetadataWritability.SYSTEM,
  }));
  const fields = Object.values(
    standard.flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (field) =>
        // Relations are created with both sides, including the inverse field
        // on a non-history object such as workspaceMember.
        (objectIdentifiers.has(field.objectMetadataUniversalIdentifier) ||
          (isDefined(field.relationTargetObjectMetadataUniversalIdentifier) &&
            objectIdentifiers.has(
              field.relationTargetObjectMetadataUniversalIdentifier,
            ))) &&
        !isDefined(
          existing.flatFieldMetadataMaps.byUniversalIdentifier[
            field.universalIdentifier
          ],
        ),
    )
    .map((field) =>
      // Existing threads get their owner from the 2.43 backfill, which then
      // makes the column required; it cannot be added as NOT NULL before.
      field.universalIdentifier ===
        STANDARD_OBJECTS.agentChatThread.fields.workspaceMember
          .universalIdentifier &&
      isDefined(
        existing.flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ],
      )
        ? { ...field, isNullable: true }
        : field,
    );
  const indexes = Object.values(standard.flatIndexMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (index) =>
        objectIdentifiers.has(index.objectMetadataUniversalIdentifier) &&
        !isDefined(
          existing.flatIndexMaps.byUniversalIdentifier[
            index.universalIdentifier
          ],
        ),
    );
  const protectedFields: typeof fields = fields.map((field) => ({
    ...field,
    writability: MetadataWritability.SYSTEM,
  }));
  return { objects: protectedObjects, fields: protectedFields, indexes };
};
