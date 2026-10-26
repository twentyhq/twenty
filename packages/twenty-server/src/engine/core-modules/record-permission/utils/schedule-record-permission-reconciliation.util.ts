import { type RecordPermissionDatabase } from 'src/engine/core-modules/record-permission/types/record-permission-database.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const scheduleRecordPermissionReconciliation = async ({
  database,
  schemaName,
}: {
  database: RecordPermissionDatabase;
  schemaName: string;
}): Promise<void> => {
  const schema = escapeIdentifier(schemaName);

  // Persisted completion times survive missed cron ticks and worker restarts.
  await database.query(
    `WITH active_scans AS MATERIALIZED (
      SELECT scan.* FROM ${schema}."recordPermissionScan" scan
      JOIN ${schema}."recordPermissionState" state ON state."activeRevisionId" = scan."revisionId"
    ), next_scan AS (
      SELECT "revisionId", "objectMetadataId" FROM active_scans
      WHERE complete
        AND NOT EXISTS (SELECT 1 FROM active_scans WHERE NOT complete)
        AND NOT EXISTS (SELECT 1 FROM active_scans WHERE "completedAt" > now() - interval '15 minutes')
      ORDER BY "completedAt" NULLS FIRST, "objectMetadataId" LIMIT 1
    )
    UPDATE ${schema}."recordPermissionScan" scan
    SET "blockCursor" = 0, "blockLimit" = NULL, "relationFileNode" = NULL, complete = false, processed = 0
    FROM next_scan
    WHERE scan."revisionId" = next_scan."revisionId" AND scan."objectMetadataId" = next_scan."objectMetadataId"`,
  );
};
