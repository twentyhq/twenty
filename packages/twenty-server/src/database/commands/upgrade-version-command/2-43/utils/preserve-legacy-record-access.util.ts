import { type EntityManager } from 'typeorm';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const LEGACY_ACCESS_MIGRATION_KEY =
  'COMMON_RECORD_SHARING_LEGACY_ACCESS_MIGRATED';

export const preserveLegacyRecordAccess = async ({
  manager,
  workspaceId,
  objects,
  wasRecordSharingEnabled,
}: {
  manager: EntityManager;
  workspaceId: string;
  objects: FlatObjectMetadata[];
  wasRecordSharingEnabled: boolean;
}): Promise<void> => {
  // Completing even a no-op decision prevents a later flag change or retry
  // from sharing records created after this upgrade.
  const inserted = await manager.query<{ id: string }[]>(
    `INSERT INTO core."keyValuePair" ("key", "workspaceId", "type", "value")
     VALUES ($1, $2, 'CONFIG_VARIABLE', 'true'::jsonb)
     ON CONFLICT DO NOTHING RETURNING id`,
    [LEGACY_ACCESS_MIGRATION_KEY, workspaceId],
  );
  const thread = objects.find(
    (object) =>
      object.universalIdentifier ===
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  );
  // Fresh workspaces already use the new private metadata and need no compatibility grants.
  if (
    inserted.length === 0 ||
    wasRecordSharingEnabled ||
    thread?.readability !== MetadataReadability.SYSTEM
  ) {
    return;
  }
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
  for (const object of objects) {
    if (
      object.universalIdentifier ===
        STANDARD_OBJECTS.agentChatThread.universalIdentifier ||
      ![MetadataReadability.PRIVATE, MetadataReadability.INHERITED].includes(
        object.readability,
      )
    ) {
      continue;
    }
    await manager.query(
      `INSERT INTO ${schema}."recordShare"
       ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
       SELECT $1, record.id, $2, 'EVERYONE', 'FULL', 'MANUAL', record.id
       FROM ${schema}.${escapeIdentifier(computeObjectTargetTable(object))} record
       ON CONFLICT DO NOTHING`,
      [object.id, EVERYONE_PRINCIPAL_ID],
    );
  }
};
