import { type EntityManager } from 'typeorm';
import { isLegacyRecordAccessOpen } from 'src/engine/core-modules/record-share/utils/is-legacy-record-access-open.util';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { resolveInheritedReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RowAccessPolicyEnvironment } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const LEGACY_ACCESS_MIGRATION_KEY =
  'COMMON_RECORD_SHARING_LEGACY_ACCESS_MIGRATED';
const BACKFILL_BATCH_SIZE = 10000;

export const preserveLegacyRecordAccess = async ({
  manager,
  workspaceId,
  objects,
  wasRecordSharingEnabled,
  inheritanceMetadata,
}: {
  manager: EntityManager;
  workspaceId: string;
  objects: FlatObjectMetadata[];
  wasRecordSharingEnabled: boolean;
  inheritanceMetadata?: Pick<
    RowAccessPolicyEnvironment,
    'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
  >;
}): Promise<void> => {
  const completed = await manager.query<{ id: string }[]>(
    'SELECT id FROM core."keyValuePair" WHERE "key" = $1 AND "workspaceId" = $2',
    [LEGACY_ACCESS_MIGRATION_KEY, workspaceId],
  );
  if (completed.length > 0) {
    return;
  }
  if (
    isLegacyRecordAccessOpen({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: Object.fromEntries(
          objects.map((object) => [object.universalIdentifier, object]),
        ),
      },
      wasRecordSharingEnabled,
    })
  ) {
    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const snapshot = new Date();
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
      const table = `${schema}.${escapeIdentifier(computeObjectTargetTable(object))}`;
      const [lastRecord] = await manager.query<{ id: string }[]>(
        `SELECT id FROM ${table} ORDER BY id DESC LIMIT 1`,
      );
      if (!isDefined(lastRecord)) {
        continue;
      }
      const openParents =
        object.readability === MetadataReadability.INHERITED &&
        isDefined(inheritanceMetadata)
          ? resolveInheritedReadabilityParents({
              flatObjectMetadata: object,
              ...inheritanceMetadata,
            }).filter(
              (parent) =>
                parent.kind === 'column' &&
                parent.parentFlatObjectMetadata.readability ===
                  MetadataReadability.OPEN &&
                parent.parentFlatObjectMetadata.writability ===
                  MetadataWritability.OPEN,
            )
          : [];
      // Rows attached directly to an OPEN parent already have shared access.
      const detachedCondition = openParents
        .flatMap((parent) =>
          parent.kind === 'column'
            ? [`record.${escapeIdentifier(parent.joinColumnName)} IS NULL`]
            : [],
        )
        .join(' AND ');
      let cursor = '00000000-0000-0000-0000-000000000000';
      while (true) {
        const [batch] = await manager.query<
          { lastId: string | null; count: number }[]
        >(
          `WITH batch AS (
            SELECT record.id FROM ${table} record
            WHERE record.id > $3::uuid AND record.id <= $4::uuid AND record."createdAt" <= $5
            ${detachedCondition ? `AND (${detachedCondition})` : ''}
            ORDER BY record.id LIMIT ${BACKFILL_BATCH_SIZE}
          ), inserted AS (
            INSERT INTO ${schema}."recordShare" ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
            SELECT $1::uuid, batch.id, $2::uuid, 'EVERYONE', 'FULL', 'APPLICATION', $1::uuid FROM batch
            ON CONFLICT DO NOTHING RETURNING id
          ) SELECT max(id::text) AS "lastId", count(*)::int AS count FROM batch`,
          [object.id, EVERYONE_PRINCIPAL_ID, cursor, lastRecord.id, snapshot],
        );
        if (!isDefined(batch?.lastId)) {
          break;
        }
        cursor = batch.lastId;
        if (batch.count < BACKFILL_BATCH_SIZE) {
          break;
        }
      }
    }
  }
  // Mark even a no-op decision, but only after every batch commits, so retries
  // cannot widen access to records created after a completed upgrade.
  await manager.query(
    `INSERT INTO core."keyValuePair" ("key", "workspaceId", "type", "value") VALUES ($1, $2, 'CONFIG_VARIABLE', 'true'::jsonb) ON CONFLICT DO NOTHING`,
    [LEGACY_ACCESS_MIGRATION_KEY, workspaceId],
  );
};
