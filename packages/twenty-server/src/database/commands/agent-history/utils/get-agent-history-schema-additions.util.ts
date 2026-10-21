import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ACTIVE_AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
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
    ACTIVE_AGENT_HISTORY_TABLES.map(
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
          // INHERITED once threads can belong to a workflow run; a thread without one reads through its own grants
          (current.readability === MetadataReadability.PRIVATE ||
            current.readability === MetadataReadability.INHERITED) &&
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
  // Preparation can run before history is copied and ownership backfilled, so stay protected until the sharing upgrade
  const protectedObjects: typeof objects = objects.map((object) => ({
    ...object,
    readability: MetadataReadability.SYSTEM,
    writability: MetadataWritability.SYSTEM,
  }));
  // Objects added later (e.g. agentChatThreadTarget) get both relation legs from their own command; a leg emitted
  // here before that object exists would have no other side and fail validation
  const existsOnceProvisioned = (objectUniversalIdentifier: string) =>
    objectIdentifiers.has(objectUniversalIdentifier) ||
    isDefined(
      existing.flatObjectMetadataMaps.byUniversalIdentifier[
        objectUniversalIdentifier
      ],
    );
  // Relations into history objects (e.g. the attachment morph target) must be provisioned with them, or only one half exists
  const historyFields = Object.values(
    standard.flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (field) =>
        (objectIdentifiers.has(field.objectMetadataUniversalIdentifier) ||
          (isDefined(field.relationTargetObjectMetadataUniversalIdentifier) &&
            objectIdentifiers.has(
              field.relationTargetObjectMetadataUniversalIdentifier,
            ))) &&
        existsOnceProvisioned(field.objectMetadataUniversalIdentifier) &&
        (!isDefined(field.relationTargetObjectMetadataUniversalIdentifier) ||
          existsOnceProvisioned(
            field.relationTargetObjectMetadataUniversalIdentifier,
          )),
    );
  const fields = historyFields.filter(
    (field) =>
      !isDefined(
        existing.flatFieldMetadataMaps.byUniversalIdentifier[
          field.universalIdentifier
        ],
      ),
  );
  const historyFieldIdentifiers = new Set<string>(
    historyFields.map(({ universalIdentifier }) => universalIdentifier),
  );
  const indexes = Object.values(standard.flatIndexMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (index) =>
        (objectIdentifiers.has(index.objectMetadataUniversalIdentifier) ||
          (isNonEmptyArray(index.universalFlatIndexFieldMetadatas) &&
            index.universalFlatIndexFieldMetadatas.every(
              ({ fieldMetadataUniversalIdentifier }) =>
                historyFieldIdentifiers.has(fieldMetadataUniversalIdentifier),
            ))) &&
        !isDefined(
          existing.flatIndexMaps.byUniversalIdentifier[
            index.universalIdentifier
          ],
        ),
    );
  // Inverse fields keep their standard definition so every provisioning path creates them identically
  const protectedFields: typeof fields = fields.map((field) =>
    objectIdentifiers.has(field.objectMetadataUniversalIdentifier)
      ? { ...field, writability: MetadataWritability.SYSTEM }
      : field,
  );
  return { objects: protectedObjects, fields: protectedFields, indexes };
};
