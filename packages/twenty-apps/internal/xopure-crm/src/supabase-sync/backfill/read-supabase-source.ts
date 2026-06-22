import { Pool } from 'pg';
import type {
  SupportedSourceTable,
} from '../types/mapped-source-record.type';
import type { BackfillReader } from './backfill-runner';

/**
 * Trusted mapping from internal source-table names to `crm.v_twenty_*`
 * sanitized read-only views.
 * These values are compile-time constants — never from user or network input.
 *
 * All views expose `updated_at` so the default `orderColumn` works for every
 * table.
 */
export const SOURCE_TABLE_TO_CRM_VIEW: Record<
  SupportedSourceTable,
  { table: string; select: string; orderColumn?: string }
> = {
  profiles: {
    table: 'crm.v_twenty_people',
    select: '*',
  },
  customer_expertise: {
    table: 'crm.v_twenty_customer_expertise',
    select: '*',
  },
  affiliates: {
    table: 'crm.v_twenty_ambassadors',
    select: '*',
  },
  products: {
    table: 'crm.v_twenty_products',
    select: '*',
  },
  orders: {
    table: 'crm.v_twenty_orders',
    select: '*',
  },
  payments: {
    table: 'crm.v_twenty_payments',
    select: '*',
  },
  order_items: {
    table: 'crm.v_twenty_order_items',
    select: '*',
  },
  commission_ledger: {
    table: 'crm.v_twenty_commissions',
    select: '*',
  },
  support_tickets: {
    table: 'crm.v_twenty_support_tickets',
    select: '*',
  },
};

/**
 * Minimal injectable Postgres pool interface.
 * Compatible with both `pg.Pool` and test fakes.
 */
export interface PoolLike {
  query: (
    text: string,
    params?: unknown[],
  ) => Promise<{ rows: Array<Record<string, unknown>> }>;
}

export type CreatePool = (dsn: string) => PoolLike;

export type SupabaseReaderOptions = {
  dsn: string;
  batchSize?: number;
  createPool?: CreatePool;
};

const DEFAULT_BATCH_SIZE = 100;
const MAX_POOL_SIZE = 5;

export const defaultCreatePool: CreatePool = (dsn: string): PoolLike => {
  return new Pool({
    connectionString: dsn,
    max: MAX_POOL_SIZE,
    options: '-c default_transaction_read_only=on',
  });
};

/**
 * Sanitize an error message so the DSN / host / password never leaks.
 */
function sanitizeError(cause: unknown, sourceTable: string): Error {
  const message =
    cause instanceof Error
      ? cause.message
      : typeof cause === 'string'
        ? cause
        : 'unknown error';

  const sanitized = message.replace(
    /(?:postgres|postgresql|pg):\/\/[^\s]*/gi,
    '[REDACTED-DSN]',
  );

  return new Error(
    `Failed to read from Supabase source table "${sourceTable}": ${sanitized}`,
  );
}

function assertSupportedSourceTable(
  sourceTable: string,
): asserts sourceTable is SupportedSourceTable {
  if (!(sourceTable in SOURCE_TABLE_TO_CRM_VIEW)) {
    throw new Error(`Unsupported Supabase source table: ${sourceTable}`);
  }
}

/**
 * Create a {@link BackfillReader} that paginates through a Supabase read-only
 * Postgres table and returns all rows.
 *
 * The table name and column select list come exclusively from the compile-time
 * {@link SOURCE_TABLE_TO_CRM_VIEW} mapping and are interpolated directly —
 * safe because they bypass all user and network input — while LIMIT and OFFSET
 * remain bound parameters.
 *
 * Pagination stops when a page returns fewer rows than `batchSize` (short page).
 * If every page so far returned exactly `batchSize` rows, one final trailing
 * query is issued at the next offset to confirm there are no more rows.
 *
 * @param input Either a DSN string or a {@link SupabaseReaderOptions} object.
 */
export function createSupabaseReader(
  input: string | SupabaseReaderOptions,
): BackfillReader {
  const opts: SupabaseReaderOptions =
    typeof input === 'string' ? { dsn: input } : input;

  const dsn = opts.dsn;
  const batchSize = opts.batchSize ?? DEFAULT_BATCH_SIZE;
  const createPool = opts.createPool ?? defaultCreatePool;

  const pool = createPool(dsn);

  return async (
    sourceTable: SupportedSourceTable,
  ): Promise<Array<Record<string, unknown>>> => {
    assertSupportedSourceTable(sourceTable);

    const source = SOURCE_TABLE_TO_CRM_VIEW[sourceTable];
    const allRows: Array<Record<string, unknown>> = [];
    let offset = 0;

    const orderColumn = source.orderColumn ?? 'updated_at';

    // Safe dynamic identifiers: table and select come ONLY from the
    // compile-time constant SOURCE_TABLE_TO_CRM_VIEW.
    const text = `SELECT ${source.select} FROM ${source.table} ORDER BY ${orderColumn} ASC NULLS LAST, id ASC LIMIT $1 OFFSET $2`;

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { rows } = await pool.query(text, [batchSize, offset]);

        if (rows.length === 0) {
          break;
        }

        allRows.push(...rows);
        offset += batchSize;

        // Short page means we've exhausted the data — no trailing query needed.
        if (rows.length < batchSize) {
          break;
        }
      }
    } catch (cause: unknown) {
      // Gracefully skip missing views/tables (e.g. optional profiles/people view).
      // PostgreSQL error code 42P01 = undefined_table.
      const code = (cause as { code?: string })?.code;
      if (code === '42P01') {
        console.warn(
          `Warning: Supabase source table "${sourceTable}" does not exist — returning empty.`,
        );
        return [];
      }
      throw sanitizeError(cause, sourceTable);
    }

    return allRows;
  };
}

/**
 * Create a {@link BackfillReader} from the `XOPURE_SUPABASE_READONLY_DSN`
 * environment variable.
 *
 * @param env  Optional environment bag (defaults to `process.env`).
 * @param deps Optional dependency overrides (e.g. a test fake for `createPool`).
 */
export function createSupabaseReaderFromEnv(
  env?: Record<string, string | undefined>,
  deps?: { createPool?: CreatePool },
): BackfillReader {
  const environment = env ?? process.env;
  const dsn = environment.XOPURE_SUPABASE_READONLY_DSN;

  if (!dsn) {
    throw new Error('XOPURE_SUPABASE_READONLY_DSN is required');
  }

  return createSupabaseReader({
    dsn,
    createPool: deps?.createPool,
  });
}
