import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ACTIVE_AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

type AgentHistorySchemaMaps = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatIndexMaps'
>;

export type LegacyObjectAccess = {
  readability: MetadataReadability;
  writability: MetadataWritability;
};

const hasValidLegacyProtection = ({
  identifier,
  legacyObjectAccess,
}: {
  identifier: string;
  legacyObjectAccess: LegacyObjectAccess | undefined;
}): boolean =>
  !isDefined(legacyObjectAccess) ||
  (legacyObjectAccess.readability === MetadataReadability.SYSTEM &&
    legacyObjectAccess.writability === MetadataWritability.SYSTEM) ||
  (identifier === STANDARD_OBJECTS.agentChatThread.universalIdentifier &&
    // INHERITED once threads can belong to a workflow run; a thread without one reads through its own grants
    (legacyObjectAccess.readability === MetadataReadability.PRIVATE ||
      legacyObjectAccess.readability === MetadataReadability.INHERITED) &&
    legacyObjectAccess.writability === MetadataWritability.OPEN);

export const getAgentHistorySchemaAdditions = ({
  existing,
  standard,
  legacyObjectAccessByUniversalIdentifier = {},
}: {
  existing: AgentHistorySchemaMaps;
  standard: AgentHistorySchemaMaps;
  legacyObjectAccessByUniversalIdentifier?: Partial<
    Record<string, LegacyObjectAccess>
  >;
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
    if (
      isDefined(current) &&
      (current.nameSingular !== expected?.nameSingular ||
        !hasValidLegacyProtection({
          identifier,
          legacyObjectAccess:
            legacyObjectAccessByUniversalIdentifier[identifier],
        }) ||
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
  const protectedFieldUniversalIdentifiers = fields
    .filter((field) =>
      objectIdentifiers.has(field.objectMetadataUniversalIdentifier),
    )
    .map(({ universalIdentifier }) => universalIdentifier);
  return { objects, fields, indexes, protectedFieldUniversalIdentifiers };
};
