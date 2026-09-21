import {
  STANDARD_OBJECT_FIELDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

type AgentHistorySchemaMaps = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatIndexMaps'
>;

// agentChatThread.recordTargets is the far leg of a relation whose near leg
// lives on agentChatThreadTarget, an object this migration does not provision.
// Creating it here would emit half a relation and fail validation, so the
// command that provisions that object owns both legs instead.
const FIELD_UNIVERSAL_IDENTIFIERS_PROVISIONED_ELSEWHERE = new Set([
  STANDARD_OBJECT_FIELDS.agentChatThread.recordTargets.universalIdentifier,
]);

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
    if (
      isDefined(current) &&
      (current.nameSingular !== expected?.nameSingular ||
        current.readability !== MetadataReadability.SYSTEM ||
        current.writability !== MetadataWritability.SYSTEM ||
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
  const fields = Object.values(
    standard.flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (field) =>
        objectIdentifiers.has(field.objectMetadataUniversalIdentifier) &&
        !FIELD_UNIVERSAL_IDENTIFIERS_PROVISIONED_ELSEWHERE.has(
          field.universalIdentifier,
        ) &&
        !isDefined(
          existing.flatFieldMetadataMaps.byUniversalIdentifier[
            field.universalIdentifier
          ],
        ),
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
  return { objects, fields, indexes };
};
