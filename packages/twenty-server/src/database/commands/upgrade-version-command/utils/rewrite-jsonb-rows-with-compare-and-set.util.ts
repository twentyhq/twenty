import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

const REWRITE_BATCH_SIZE = 100;

export type StoredJsonbRow<TValue> = { id: string; value: TValue };

export const rewriteJsonbRowsWithCompareAndSet = async <TValue>({
  dataSource,
  isDryRun,
  tableName,
  columnName,
  whereClause,
  whereParameters,
  mapRow,
}: {
  dataSource: DataSource;
  isDryRun: boolean;
  tableName: string;
  columnName: string;
  whereClause: string;
  whereParameters: unknown[];
  mapRow: (row: StoredJsonbRow<TValue>) => {
    value: TValue;
    hasChanged: boolean;
  };
}): Promise<number> => {
  let rewrittenRowCount = 0;
  let afterRowId: string | undefined;

  while (true) {
    const parameters = isDefined(afterRowId)
      ? [...whereParameters, afterRowId]
      : whereParameters;

    const rows: StoredJsonbRow<TValue>[] = await dataSource.query(
      `SELECT id, ${columnName} AS value FROM ${tableName} WHERE (${whereClause})${isDefined(afterRowId) ? ` AND id > $${parameters.length}` : ''} ORDER BY id LIMIT ${REWRITE_BATCH_SIZE}`,
      parameters,
    );

    const rewrites = rows.flatMap((row) => {
      const { value, hasChanged } = mapRow(row);

      return hasChanged ? [{ id: row.id, from: row.value, to: value }] : [];
    });

    if (isDryRun) {
      rewrittenRowCount += rewrites.length;
    } else if (rewrites.length > 0) {
      const [, updatedRowCount]: [unknown, number] = await dataSource.query(
        `UPDATE ${tableName} AS target SET ${columnName} = rewrite."to" FROM jsonb_to_recordset($1::jsonb) AS rewrite(id uuid, "from" jsonb, "to" jsonb) WHERE target.id = rewrite.id AND target.${columnName} = rewrite."from"`,
        [JSON.stringify(rewrites)],
      );

      rewrittenRowCount += updatedRowCount;
    }

    if (rows.length < REWRITE_BATCH_SIZE) {
      return rewrittenRowCount;
    }

    afterRowId = rows[rows.length - 1].id;
  }
};
