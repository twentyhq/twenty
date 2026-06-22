import { computeContentHash } from '../utils/compute-content-hash';

export type RawMirrorTable = {
  sourceSchema: string;
  sourceTable: string;
  targetTableName: string;
};

export type RawMirrorRecord = RawMirrorTable & {
  sourceRecordId: string;
  payload: Record<string, unknown>;
  contentHash: string;
};

export type RawMirrorError = RawMirrorTable & {
  sourceRecordId: string | null;
  error: string;
};

export type RawMirrorDryRunInput = {
  discoverTables: () => Promise<RawMirrorTable[]>;
  readTableRows: (
    table: RawMirrorTable,
  ) => Promise<Array<Record<string, unknown>>>;
};

export type RawMirrorDryRunResult = {
  dryRun: true;
  tableCount: number;
  scanned: number;
  hashed: number;
  failed: number;
  records: RawMirrorRecord[];
  errors: RawMirrorError[];
};

export interface RawMirrorPoolLike {
  query: (
    text: string,
    params?: unknown[],
  ) => Promise<{ rows: Array<Record<string, unknown>> }>;
}

const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

const assertSafeIdentifier = (identifier: string): void => {
  if (!IDENTIFIER_PATTERN.test(identifier)) {
    throw new Error(`Unsafe SQL identifier for raw mirror: ${identifier}`);
  }
};

const quoteIdentifier = (identifier: string): string => {
  assertSafeIdentifier(identifier);

  return `"${identifier}"`;
};

const stringValue = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const rawSourceRecordId = (row: Record<string, unknown>): string | null => {
  const id =
    stringValue(row.id) ??
    stringValue(row.uuid) ??
    stringValue(row.source_id) ??
    stringValue(row.ticket_id) ??
    stringValue(row.ticket_number) ??
    null;

  if (id !== null) {
    return id;
  }

  const numericId = row.id;

  return typeof numericId === 'number' && Number.isFinite(numericId)
    ? String(numericId)
    : null;
};

export const getRawMirrorTargetTableName = (sourceTable: string): string => {
  assertSafeIdentifier(sourceTable);

  return `_xopureRaw_${sourceTable}`;
};

export const discoverRawMirrorTables = async (
  pool: RawMirrorPoolLike,
  sourceSchema = 'public',
): Promise<RawMirrorTable[]> => {
  assertSafeIdentifier(sourceSchema);

  const result = await pool.query(
    `select table_schema, table_name
       from information_schema.tables
      where table_schema = $1
        and table_type = 'BASE TABLE'
      order by table_name asc`,
    [sourceSchema],
  );

  return result.rows.map((row) => {
    const schema = stringValue(row.table_schema) ?? sourceSchema;
    const table = stringValue(row.table_name);

    if (!table) {
      throw new Error('Raw mirror table discovery returned a row without table_name');
    }

    return {
      sourceSchema: schema,
      sourceTable: table,
      targetTableName: getRawMirrorTargetTableName(table),
    };
  });
};

export const readRawMirrorTableRows = async (
  pool: RawMirrorPoolLike,
  table: RawMirrorTable,
  batchSize = 1_000,
): Promise<Array<Record<string, unknown>>> => {
  assertSafeIdentifier(table.sourceSchema);
  assertSafeIdentifier(table.sourceTable);

  const allRows: Array<Record<string, unknown>> = [];
  let offset = 0;
  const sql = `select * from ${quoteIdentifier(table.sourceSchema)}.${quoteIdentifier(
    table.sourceTable,
  )} order by 1 asc limit $1 offset $2`;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { rows } = await pool.query(sql, [batchSize, offset]);

    if (rows.length === 0) {
      break;
    }

    allRows.push(...rows);

    if (rows.length < batchSize) {
      break;
    }

    offset += batchSize;
  }

  return allRows;
};

export const buildRawMirrorRecord = (
  table: RawMirrorTable,
  payload: Record<string, unknown>,
): RawMirrorRecord => {
  const sourceRecordId = rawSourceRecordId(payload);

  if (!sourceRecordId) {
    throw new Error(
      `Raw mirror row for ${table.sourceSchema}.${table.sourceTable} is missing a stable source id`,
    );
  }

  return {
    ...table,
    sourceRecordId,
    payload,
    contentHash: computeContentHash({
      sourceSchema: table.sourceSchema,
      sourceTable: table.sourceTable,
      sourceRecordId,
      payload,
    }),
  };
};

export const runXopureRawMirrorDryRun = async (
  input: RawMirrorDryRunInput,
): Promise<RawMirrorDryRunResult> => {
  const tables = await input.discoverTables();
  const records: RawMirrorRecord[] = [];
  const errors: RawMirrorError[] = [];
  let scanned = 0;

  for (const table of tables) {
    const rows = await input.readTableRows(table);

    for (const row of rows) {
      scanned += 1;

      try {
        records.push(buildRawMirrorRecord(table, row));
      } catch (error) {
        errors.push({
          ...table,
          sourceRecordId: rawSourceRecordId(row),
          error: error instanceof Error ? error.message : 'Unknown raw mirror error',
        });
      }
    }
  }

  return {
    dryRun: true,
    tableCount: tables.length,
    scanned,
    hashed: records.length,
    failed: errors.length,
    records,
    errors,
  };
};
