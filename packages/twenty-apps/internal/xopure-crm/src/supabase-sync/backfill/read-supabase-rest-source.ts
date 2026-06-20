import type {
  SupportedSourceTable,
} from '../types/mapped-source-record.type';
import type { BackfillReader } from './backfill-runner';
import {
  createSupabaseReaderFromEnv as createSupabasePostgresReaderFromEnv,
  type CreatePool,
} from './read-supabase-source';

export type SupabaseRestRow = Record<string, unknown>;

type FetchLike = (
  input: string,
  init: {
    method: 'GET';
    headers: Record<string, string>;
  },
) => Promise<Response>;

type RestSource = {
  table: string;
  select: string;
  normalize?: (row: SupabaseRestRow) => SupabaseRestRow;
};

export type SupabaseRestReaderOptions = {
  url: string;
  key: string;
  schema?: string;
  batchSize?: number;
  fetch?: FetchLike;
};

const DEFAULT_BATCH_SIZE = 100;
const PUBLIC_SCHEMA = 'public';
const PGRST_MISSING_TABLE_CODE = 'PGRST205';

const normalizeCustomerExpertise = (
  row: SupabaseRestRow,
): SupabaseRestRow => ({
  ...row,
  name: row.name ?? row.customer_id,
  email: row.email ?? null,
  lifetime_value_cents: row.lifetime_value_cents ?? 0,
  order_count: row.order_count ?? 0,
  last_order_at: row.last_order_at ?? null,
});

const normalizePaymentFromOrder = (row: SupabaseRestRow): SupabaseRestRow => ({
  ...row,
  order_id: row.order_id ?? row.id,
  rail: row.rail ?? null,
  method_code: row.method_code ?? row.provider,
  amount_cents: row.amount_cents ?? row.subtotal_cents ?? 0,
  refund_amount_cents: row.refund_amount_cents ?? 0,
  provider_payment_id: row.provider_payment_id ?? null,
  description: row.description ?? null,
});

const toTwentyDateTime = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Date(timestamp).toISOString().replace(/\.\d{3}Z$/, 'Z');
};

const normalizeDateTimeFields = (row: SupabaseRestRow): SupabaseRestRow =>
  Object.entries(row).reduce<SupabaseRestRow>((accumulator, [key, value]) => {
    accumulator[key] = key.endsWith('_at') ? toTwentyDateTime(value) : value;

    return accumulator;
  }, {});

export const SOURCE_TABLE_TO_REST_SOURCE: Record<
  SupportedSourceTable,
  RestSource
> = {
  profiles: {
    table: 'profiles',
    select: 'id,first_name,last_name,email,phone,created_at,updated_at',
  },
  customer_expertise: {
    table: 'customer_expertise',
    select: 'id,customer_id,created_at,updated_at',
    normalize: normalizeCustomerExpertise,
  },
  affiliates: {
    table: 'affiliates',
    select: [
      'id',
      'user_id',
      'email',
      'name',
      'tracking_code',
      'parent_id',
      'status',
      'rank',
      'career_rank',
      'paid_as_rank',
      'active_customer_count',
      'personal_volume_cents',
      'team_volume_cents',
      'reason',
      'phone',
      'show_peptides_link',
      'created_at',
    ].join(','),
  },
  products: {
    table: 'products',
    select: [
      'id',
      'name',
      'sku',
      'price_cents',
      'currency',
      'category',
      'active',
      'cv_amount:cv_amount_cents',
      'created_at',
      'updated_at',
    ].join(','),
  },
  orders: {
    table: 'orders',
    select: [
      'id',
      'user_email',
      'customer_id',
      'subtotal_cents',
      'discount_amount_cents:discount_cents',
      'shipping_cents:shipping_cost_cents',
      'tax_cents',
      'total_cents',
      'currency',
      'affiliate_chain',
      'payment_status',
      'fulfillment_status',
      'cv_amount',
      'buyer_type',
      'payment_method_code',
      'manual_review_required',
      'tracking_number',
      'tracking_url',
      'shipped_at',
      'delivered_at',
      'created_at',
    ].join(','),
  },
  payments: {
    table: 'orders',
    select: [
      'id',
      'order_id:id',
      'provider:payment_gateway',
      'method_code:payment_gateway',
      'amount_cents:total_cents',
      'subtotal_cents',
      'currency',
      'status:payment_status',
      'created_at',
    ].join(','),
    normalize: normalizePaymentFromOrder,
  },
  order_items: {
    table: 'order_items',
    select: [
      'id',
      'order_id',
      'product_id',
      'name',
      'sku',
      'quantity',
      'unit_price_cents',
      'line_total_cents',
      'category',
      'created_at',
      'updated_at',
    ].join(','),
  },
  commission_ledger: {
    table: 'commission_ledger',
    select: [
      'id',
      'order_id',
      'affiliate_id',
      'level',
      'percentage_bps',
      'amount_cents',
      'status',
      'hold_until',
      'paid_at',
      'pay_area',
      'rate_used',
      'base_cv_amount',
      'source_affiliate_id',
      'period_id',
      'created_at',
      'updated_at',
    ].join(','),
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

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

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const redactSensitiveValues = (
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

const sanitizeError = (
  cause: unknown,
  sourceTable: SupportedSourceTable,
  url: string,
  key: string,
): Error => {
  const message =
    cause instanceof Error
      ? cause.message
      : typeof cause === 'string'
        ? cause
        : 'unknown error';

  return new Error(
    `Failed to read from Supabase REST source table "${sourceTable}": ${redactSensitiveValues(
      message,
      url,
      key,
    )}`,
  );
};

function assertSupportedSourceTable(
  sourceTable: string,
): asserts sourceTable is SupportedSourceTable {
  if (!(sourceTable in SOURCE_TABLE_TO_REST_SOURCE)) {
    throw new Error(`Unsupported Supabase source table: ${sourceTable}`);
  }
}

const getRestBaseUrl = (url: string): string => {
  const trimmedUrl = url.trim().replace(/\/+$/, '');

  try {
    new URL(trimmedUrl);
  } catch {
    throw new Error('Invalid Supabase REST URL');
  }

  return trimmedUrl.endsWith('/rest/v1') ? trimmedUrl : `${trimmedUrl}/rest/v1`;
};

const buildRestUrl = (baseUrl: string, source: RestSource): string => {
  const url = new URL(`${baseUrl}/${encodeURIComponent(source.table)}`);

  url.searchParams.set('select', source.select);
  url.searchParams.set('order', 'created_at.asc.nullslast,id.asc');

  return url.toString();
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

const isMissingOptionalTable = (body: unknown): boolean =>
  isRecord(body) && body.code === PGRST_MISSING_TABLE_CODE;

const getRestErrorMessage = (status: number, body: unknown): string => {
  if (isRecord(body) && typeof body.message === 'string') {
    return `HTTP ${status}: ${body.message}`;
  }

  if (typeof body === 'string') {
    return `HTTP ${status}: ${body}`;
  }

  return `HTTP ${status}`;
};

const readPage = async (
  input: {
    fetcher: FetchLike;
    url: string;
    key: string;
    schema: string;
    start: number;
    end: number;
  },
): Promise<SupabaseRestRow[] | null> => {
  const headers: Record<string, string> = {
    apikey: input.key,
    Authorization: `Bearer ${input.key}`,
    'Range-Unit': 'items',
    Range: `${input.start}-${input.end}`,
  };

  if (input.schema !== PUBLIC_SCHEMA) {
    headers['Accept-Profile'] = input.schema;
  }

  const response = await input.fetcher(input.url, {
    method: 'GET',
    headers,
  });
  const body = await parseJsonBody(response);

  if (!response.ok) {
    if (isMissingOptionalTable(body)) {
      return null;
    }

    throw new Error(getRestErrorMessage(response.status, body));
  }

  if (!Array.isArray(body)) {
    throw new Error('Supabase REST returned an unexpected response shape');
  }

  return body.filter(isRecord);
};

export const createSupabaseRestReader = (
  input: SupabaseRestReaderOptions,
): BackfillReader => {
  const restBaseUrl = getRestBaseUrl(input.url);
  const key = input.key.trim();
  const schema = input.schema?.trim() || PUBLIC_SCHEMA;
  const batchSize = input.batchSize && input.batchSize > 0
    ? input.batchSize
    : DEFAULT_BATCH_SIZE;
  const fetcher = input.fetch ?? globalThis.fetch;

  if (!key) {
    throw new Error('Supabase REST key is required');
  }

  if (!fetcher) {
    throw new Error('fetch is required for Supabase REST reads');
  }

  return async (
    sourceTable: SupportedSourceTable,
  ): Promise<Array<Record<string, unknown>>> => {
    assertSupportedSourceTable(sourceTable);

    const source = SOURCE_TABLE_TO_REST_SOURCE[sourceTable];
    const url = buildRestUrl(restBaseUrl, source);
    const rows: SupabaseRestRow[] = [];
    let start = 0;

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const page = await readPage({
          fetcher,
          url,
          key,
          schema,
          start,
          end: start + batchSize - 1,
        });

        if (page === null) {
          return [];
        }

        rows.push(
          ...page.map((row) =>
            normalizeDateTimeFields(source.normalize?.(row) ?? row),
          ),
        );

        if (page.length < batchSize) {
          break;
        }

        start += batchSize;
      }
    } catch (cause: unknown) {
      throw sanitizeError(cause, sourceTable, input.url, key);
    }

    return rows;
  };
};

export const createSupabaseRestReaderFromEnv = (
  env?: Record<string, string | undefined>,
  deps?: { fetch?: FetchLike },
): BackfillReader => {
  const environment = env ?? process.env;
  const url = environment.XOPURE_SUPABASE_READONLY_REST_URL;
  const key = environment.XOPURE_SUPABASE_READONLY_REST_KEY;

  if (!url?.trim()) {
    throw new Error('XOPURE_SUPABASE_READONLY_REST_URL is required');
  }

  if (!key?.trim()) {
    throw new Error('XOPURE_SUPABASE_READONLY_REST_KEY is required');
  }

  return createSupabaseRestReader({
    url,
    key,
    schema: environment.XOPURE_SUPABASE_READONLY_REST_SCHEMA,
    fetch: deps?.fetch,
  });
};

export const createSupabaseReaderFromAnyEnv = (
  env?: Record<string, string | undefined>,
  deps?: { createPool?: CreatePool; fetch?: FetchLike },
): BackfillReader => {
  const environment = env ?? process.env;

  if (environment.XOPURE_SUPABASE_READONLY_DSN?.trim()) {
    return createSupabasePostgresReaderFromEnv(environment, {
      createPool: deps?.createPool,
    });
  }

  return createSupabaseRestReaderFromEnv(environment, { fetch: deps?.fetch });
};
