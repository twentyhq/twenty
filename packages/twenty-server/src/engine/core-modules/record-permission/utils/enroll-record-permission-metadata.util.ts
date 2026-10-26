import { RecordPermissionRevisionEntity } from 'src/engine/metadata-modules/record-permissions/entities/record-permission-revision.entity';
import { installRecordPermissionPathIndexes } from 'src/engine/core-modules/record-permission/utils/install-record-permission-path-indexes.util';
import { resolveRecordPermissionDefinition } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-definition.util';
import { createHash } from 'node:crypto';

import { type DataSource } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { type RecordPermissionMetadata } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { installRecordPermissionStorage } from 'src/engine/core-modules/record-permission/utils/install-record-permission-storage.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const enrollRecordPermissionMetadata = async ({
  dataSource,
  workspaceId,
  metadata,
  schemaName = getWorkspaceSchemaName(workspaceId),
}: {
  dataSource: DataSource;
  workspaceId: string;
  metadata: RecordPermissionMetadata;
  schemaName?: string;
}): Promise<void> => {
  const schema = escapeIdentifier(schemaName);
  const fingerprint = createHash('sha256')
    .update(
      JSON.stringify([
        2,
        Object.values(metadata.flatObjectMetadataMaps.byUniversalIdentifier)
          .filter(isDefined)
          .map((object) => [
            object.id,
            object.nameSingular,
            object.targetTableName,
            object.recordCapabilities,
            object.readability,
            object.writability,
          ])
          .sort(),
        Object.values(metadata.flatFieldMetadataMaps.byUniversalIdentifier)
          .filter(isDefined)
          .map((field) => [
            field.id,
            field.name,
            field.type,
            field.settings,
            field.relationTargetObjectMetadataId,
            field.relationTargetFieldMetadataId,
          ])
          .sort(),
      ]),
    )
    .digest('hex');
  const [state] = await dataSource.query(
    `SELECT to_jsonb(state)->>'metadataFingerprint' AS fingerprint FROM ${schema}."recordPermissionState" state WHERE id`,
  );

  if (state?.fingerprint === fingerprint) return;
  const runner = dataSource.createQueryRunner();
  await runner.connect();
  let acquired = false;
  try {
    [{ acquired }] = await runner.query(
      'SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS acquired',
      [schemaName + ':record-permission-metadata'],
    );
    if (!acquired) return;
    const [latest] = await runner.query(
      `SELECT to_jsonb(state)->>'metadataFingerprint' AS fingerprint FROM ${schema}."recordPermissionState" state WHERE id`,
    );
    if (latest?.fingerprint === fingerprint) return;
    await runner.query("SET lock_timeout = '500ms'");
    await installRecordPermissionStorage({
      database: runner,
      schemaName,
      metadata,
    });
    const revisions = await dataSource
      .getRepository(RecordPermissionRevisionEntity)
      .find({
        where: [
          { workspaceId, status: 'active' },
          { workspaceId, status: 'building' },
        ],
      });
    for (const revision of revisions) {
      await installRecordPermissionPathIndexes({
        database: runner,
        context: {
          ...metadata,
          schemaName,
          revisionId: revision.id,
          definition: resolveRecordPermissionDefinition(
            revision.definition,
            metadata,
          ),
          authorities: [],
          capabilitiesByObjectUniversalIdentifier: {},
        },
      });
    }
    await runner.startTransaction();
    await runner.query(
      'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      [schemaName + ':record-permissions'],
    );
    const objects = Object.values(
      metadata.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((object) => object.nameSingular !== 'recordShare');
    await runner.query(
      `INSERT INTO ${schema}."recordPermissionScan" ("revisionId", "objectMetadataId") SELECT revision, object FROM ${schema}."recordPermissionState", unnest(ARRAY["activeRevisionId", "candidateRevisionId"]) revision, unnest($1::uuid[]) object WHERE revision IS NOT NULL ON CONFLICT ("revisionId", "objectMetadataId") DO UPDATE SET "blockCursor" = 0, "blockLimit" = NULL, "relationFileNode" = NULL, complete = false, processed = 0`,
      [objects.map((object) => object.id)],
    );
    await runner.query(
      `DELETE FROM ${schema}."recordPermissionScan" WHERE NOT ("objectMetadataId" = ANY($1::uuid[]))`,
      [objects.map((object) => object.id)],
    );
    await runner.query(
      `UPDATE ${schema}."recordPermissionState" SET "metadataFingerprint" = $1, "bindingGeneration" = "bindingGeneration" + 1 WHERE id`,
      [fingerprint],
    );
    await runner.commitTransaction();
  } catch (error) {
    if (runner.isTransactionActive) await runner.rollbackTransaction();
    throw error;
  } finally {
    try {
      await runner.query('RESET lock_timeout');
      if (acquired)
        await runner.query(
          'SELECT pg_advisory_unlock(hashtextextended($1, 0))',
          [schemaName + ':record-permission-metadata'],
        );
    } finally {
      await runner.release();
    }
  }
};
