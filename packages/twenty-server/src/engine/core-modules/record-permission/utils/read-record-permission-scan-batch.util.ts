import { type RecordPermissionDatabase } from 'src/engine/core-modules/record-permission/types/record-permission-database.type';
import { type RecordPermissionScan } from 'src/engine/core-modules/record-permission/types/record-permission-scan.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const readRecordPermissionScanBatch = async ({
  database,
  schemaName,
  tableName,
  scan,
  batchSize,
}: {
  database: RecordPermissionDatabase;
  schemaName: string;
  tableName: string;
  scan: RecordPermissionScan;
  batchSize: number;
}): Promise<
  RecordPermissionScan & { recordIds: string[]; complete: boolean }
> => {
  const table = `${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`;
  // The caller holds a transaction: prevent a table rewrite between inspecting and scanning its pages.
  await database.query(`LOCK TABLE ${table} IN ROW EXCLUSIVE MODE`);
  const [relation] = await database.query(
    `SELECT pg_relation_filenode(oid) AS "fileNode", pg_relation_size(oid) / current_setting('block_size')::bigint AS blocks, GREATEST(1, reltuples / GREATEST(1, relpages)) AS "rowsPerBlock" FROM pg_class WHERE oid = $1::regclass`,
    [table],
  );
  const relationFileNode = Number(relation.fileNode);
  const restarting = scan.relationFileNode !== relationFileNode;
  const blockCursor = restarting ? 0 : scan.blockCursor;
  const blockLimit =
    restarting || scan.blockLimit === null
      ? Number(relation.blocks)
      : scan.blockLimit;
  const blocksPerBatch = Math.max(
    1,
    Math.min(128, Math.floor(batchSize / Number(relation.rowsPerBlock))),
  );
  const nextBlock = Math.min(blockLimit, blockCursor + blocksPerBatch);
  // UUID order scatters heap writes. These page bounds are progress only; identities remain primary keys.
  // Concurrent business changes are covered by the transactional outbox, including moves behind the cursor.
  const records = await database.query(
    `SELECT id FROM ${table} WHERE ctid >= $1::tid AND ctid < $2::tid`,
    [`(${blockCursor},0)`, `(${nextBlock},0)`],
  );
  return {
    recordIds: records.map((record) => String(record.id)),
    blockCursor: nextBlock,
    blockLimit,
    relationFileNode,
    complete: nextBlock >= blockLimit,
  };
};
