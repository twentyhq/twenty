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

export type RawMirrorFetchLike = (
  input: string,
  init: {
    method: 'GET';
    headers: Record<string, string>;
  },
) => Promise<Response>;

export type RawMirrorRestOptions = {
  url: string;
  key: string;
  schema?: string;
  batchSize?: number;
  fetch?: RawMirrorFetchLike;
};

const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const PUBLIC_SCHEMA = 'public';
const DEFAULT_REST_BATCH_SIZE = 1_000;

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

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

const getRawMirrorRestBaseUrl = (url: string): string => {
  const trimmedUrl = url.trim().replace(/\/+$/, '');

  try {
    new URL(trimmedUrl);
  } catch {
    throw new Error('Invalid Supabase REST URL');
  }

  return trimmedUrl.endsWith('/rest/v1') ? trimmedUrl : `${trimmedUrl}/rest/v1`;
};

const rawMirrorRestHeaders = (
  options: Pick<RawMirrorRestOptions, 'key' | 'schema'>,
  extraHeaders: Record<string, string> = {},
): Record<string, string> => {
  const key = options.key.trim();

  if (!key) {
    throw new Error('Supabase REST key is required for raw mirror reads');
  }

  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extraHeaders,
  };

  const schema = options.schema?.trim() || PUBLIC_SCHEMA;

  if (schema !== PUBLIC_SCHEMA) {
    headers['Accept-Profile'] = schema;
  }

  return headers;
};

const parseJsonBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error('Supabase REST returned a non-JSON response');
  }
};

const getRestErrorMessage = (status: number, body: unknown): string => {
  if (isRecord(body) && typeof body.message === 'string') {
    return `HTTP ${status}: ${body.message}`;
  }

  if (typeof body === 'string') {
    return `HTTP ${status}: ${body}`;
  }

  return `HTTP ${status}`;
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const redactionPatterns = (url: string, key: string): string[] => {
  const patterns = [url, key];

  try {
    const parsed = new URL(url);
    patterns.push(parsed.host, parsed.hostname);
  } catch {
    return patterns;
  }

  return patterns;
};

const redactRestSensitiveValues = (
  message: string,
  url: string,
  key: string,
): string => {
  let sanitized = message
    .replace(/https?:\/\/[^\s"')]+/gi, '[REDACTED-URL]')
    .replace(/(?:postgres|postgresql|pg):\/\/[^\s"')]+/gi, '[REDACTED-DSN]')
    .replace(/:\/\/([^:\s/@]+):([^@\s]+)@/g, '://[REDACTED]@[REDACTED]');

  for (const pattern of redactionPatterns(url, key)) {
    if (!pattern) {
      continue;
    }

    sanitized = sanitized.replace(
      new RegExp(escapeRegExp(pattern), 'g'),
      '[REDACTED]',
    );
  }

  return sanitized;
};

const sanitizeRestError = (
  cause: unknown,
  context: string,
  options: Pick<RawMirrorRestOptions, 'url' | 'key'>,
): Error => {
  const message =
    cause instanceof Error
      ? cause.message
      : typeof cause === 'string'
        ? cause
        : 'unknown error';

  return new Error(
    `${context}: ${redactRestSensitiveValues(message, options.url, options.key)}`,
  );
};

const parseOpenApiTableNames = (body: unknown): string[] => {
  if (!isRecord(body) || !isRecord(body.paths)) {
    throw new Error('Supabase REST OpenAPI response did not include paths');
  }

  return Object.keys(body.paths)
    .map((path) => path.replace(/^\/+/, ''))
    .filter((tableName) =>
      tableName.length > 0 &&
      !tableName.includes('/') &&
      !tableName.includes('{') &&
      IDENTIFIER_PATTERN.test(tableName),
    )
    .sort((left, right) => left.localeCompare(right));
};

export const discoverRawMirrorRestTables = async (
  options: RawMirrorRestOptions,
): Promise<RawMirrorTable[]> => {
  const fetcher = options.fetch ?? globalThis.fetch;

  if (!fetcher) {
    throw new Error('fetch is required for Supabase REST raw mirror discovery');
  }

  const sourceSchema = options.schema?.trim() || PUBLIC_SCHEMA;
  const baseUrl = getRawMirrorRestBaseUrl(options.url);

  try {
    const response = await fetcher(`${baseUrl}/`, {
      method: 'GET',
      headers: rawMirrorRestHeaders(options, {
        Accept: 'application/openapi+json',
      }),
    });
    const body = await parseJsonBody(response);

    if (!response.ok) {
      throw new Error(getRestErrorMessage(response.status, body));
    }

    return parseOpenApiTableNames(body).map((sourceTable) => ({
      sourceSchema,
      sourceTable,
      targetTableName: getRawMirrorTargetTableName(sourceTable),
    }));
  } catch (cause: unknown) {
    throw sanitizeRestError(
      cause,
      'Failed to discover Supabase REST raw mirror tables',
      options,
    );
  }
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

export const readRawMirrorRestTableRows = async (
  options: RawMirrorRestOptions,
  table: RawMirrorTable,
): Promise<Array<Record<string, unknown>>> => {
  const fetcher = options.fetch ?? globalThis.fetch;

  if (!fetcher) {
    throw new Error('fetch is required for Supabase REST raw mirror reads');
  }

  assertSafeIdentifier(table.sourceTable);

  const batchSize = options.batchSize && options.batchSize > 0
    ? options.batchSize
    : DEFAULT_REST_BATCH_SIZE;
  const baseUrl = getRawMirrorRestBaseUrl(options.url);
  const url = new URL(`${baseUrl}/${encodeURIComponent(table.sourceTable)}`);
  const allRows: Array<Record<string, unknown>> = [];
  let start = 0;

  url.searchParams.set('select', '*');

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const response = await fetcher(url.toString(), {
        method: 'GET',
        headers: rawMirrorRestHeaders(options, {
          'Range-Unit': 'items',
          Range: `${start}-${start + batchSize - 1}`,
        }),
      });
      const body = await parseJsonBody(response);

      if (!response.ok) {
        throw new Error(getRestErrorMessage(response.status, body));
      }

      if (!Array.isArray(body)) {
        throw new Error('Supabase REST returned an unexpected response shape');
      }

      allRows.push(...body.filter(isRecord));

      if (body.length < batchSize) {
        break;
      }

      start += batchSize;
    }
  } catch (cause: unknown) {
    throw sanitizeRestError(
      cause,
      `Failed to read Supabase REST raw mirror table "${table.sourceTable}"`,
      options,
    );
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
