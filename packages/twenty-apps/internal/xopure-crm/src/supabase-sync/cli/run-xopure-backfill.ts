import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BACKFILL_SOURCE_ORDER } from '../backfill/backfill-runner';
import { createSupabaseReaderFromAnyEnv } from '../backfill/read-supabase-rest-source';
import {
  runXopureBackfill,
  type BackfillResult,
} from '../backfill/run-xopure-backfill';
import { createTwentyRestClient } from '../twenty-rest-client';
import type { TwentyClientLike } from '../types/twenty-client-like.type';
import type { SupportedSourceTable } from '../types/mapped-source-record.type';

type Env = Record<string, string | undefined>;

type CliArgs = {
  dryRun: boolean;
  sourceTable?: SupportedSourceTable;
  delayMs?: number;
  maxRetries?: number;
};

type ExecuteCliDeps = {
  env?: Env;
  write?: (chunk: string) => void;
};

type RequiredEnv = {
  apiUrl: string;
  apiKey: string;
};

type SummaryError = {
  sourceTable?: string;
  targetObject?: string;
  code?: string;
  message: string;
};

type SummaryResult = Omit<BackfillResult, 'records' | 'errors'> & {
  errors: SummaryError[];
};

const SECRET_ENV_NAMES = [
  'XOPURE_TWENTY_API_KEY',
  'TWENTY_API_KEY',
  'XOPURE_SUPABASE_READONLY_DSN',
  'XOPURE_SUPABASE_READONLY_REST_KEY',
];

const isSupportedSourceTable = (
  sourceTable: string,
): sourceTable is SupportedSourceTable =>
  (BACKFILL_SOURCE_ORDER as readonly string[]).includes(sourceTable);

const firstNonEmpty = (
  ...values: Array<string | undefined>
): string | undefined => {
  for (const value of values) {
    const trimmed = value?.trim();

    if (trimmed) {
      return trimmed;
    }
  }

  return undefined;
};

const parseArgs = (argv: string[]): CliArgs => {
  const args: CliArgs = { dryRun: true };

  for (const token of argv) {
    if (token === '--live') {
      args.dryRun = false;
      continue;
    }

    if (token.startsWith('--source-table=')) {
      const sourceTable = token.slice('--source-table='.length);

      if (!isSupportedSourceTable(sourceTable)) {
        throw new Error(
          `Unsupported --source-table value. Use one of: ${BACKFILL_SOURCE_ORDER.join(', ')}`,
        );
      }

      args.sourceTable = sourceTable;
      continue;
    }

    if (token.startsWith('--delay=')) {
      const value = token.slice('--delay='.length);
      const delayMs = Number(value);
      if (Number.isNaN(delayMs) || delayMs < 0) {
        throw new Error('--delay must be a non-negative number of milliseconds.');
      }
      args.delayMs = delayMs;
      continue;
    }

    if (token.startsWith('--retry=')) {
      const value = token.slice('--retry='.length);
      const maxRetries = Number(value);
      if (Number.isNaN(maxRetries) || maxRetries < 0 || !Number.isInteger(maxRetries)) {
        throw new Error('--retry must be a non-negative integer.');
      }
      args.maxRetries = maxRetries;
      continue;
    }

    throw new Error(`Unsupported argument: ${token}`);
  }

  return args;
};

const resolveRequiredEnv = (env: Env): RequiredEnv => {
  const apiUrl = firstNonEmpty(
    env.XOPURE_TWENTY_API_URL,
    env.TWENTY_SERVER_URL,
  );

  if (!apiUrl) {
    throw new Error(
      'Missing Twenty API URL. Set XOPURE_TWENTY_API_URL or TWENTY_SERVER_URL.',
    );
  }

  const apiKey = firstNonEmpty(
    env.XOPURE_TWENTY_API_KEY,
    env.TWENTY_API_KEY,
  );

  if (!apiKey) {
    throw new Error(
      'Missing Twenty API key. Set XOPURE_TWENTY_API_KEY or TWENTY_API_KEY.',
    );
  }

  const hasDsn = Boolean(env.XOPURE_SUPABASE_READONLY_DSN?.trim());
  const hasRestSource = Boolean(
    env.XOPURE_SUPABASE_READONLY_REST_URL?.trim() &&
      env.XOPURE_SUPABASE_READONLY_REST_KEY?.trim(),
  );

  if (!hasDsn && !hasRestSource) {
    throw new Error(
      'Missing Supabase source env. Set XOPURE_SUPABASE_READONLY_DSN or both XOPURE_SUPABASE_READONLY_REST_URL and XOPURE_SUPABASE_READONLY_REST_KEY.',
    );
  }

  return { apiUrl, apiKey };
};

const redactSecrets = (message: string, env: Env): string => {
  let redacted = message;

  for (const name of SECRET_ENV_NAMES) {
    const value = env[name]?.trim();

    if (value) {
      redacted = redacted.split(value).join('[redacted]');
    }
  }

  return redacted;
};

const toSummaryError = (
  error: BackfillResult['errors'][number],
  env: Env,
): SummaryError => {
  const sourceTable =
    typeof error.sourceTable === 'string' ? error.sourceTable : undefined;
  const targetObject =
    'targetObject' in error && typeof error.targetObject === 'string'
      ? error.targetObject
      : undefined;
  const code =
    'code' in error && typeof error.code === 'string' ? error.code : undefined;
  const message =
    'error' in error && typeof error.error === 'string'
      ? error.error
      : 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Unknown backfill error';

  return {
    ...(sourceTable ? { sourceTable } : {}),
    ...(targetObject ? { targetObject } : {}),
    ...(code ? { code } : {}),
    message: redactSecrets(message, env),
  };
};

const toSummaryResult = (
  result: BackfillResult,
  env: Env,
): SummaryResult => ({
  dryRun: result.dryRun,
  scanned: result.scanned,
  mapped: result.mapped,
  created: result.created,
  updated: result.updated,
  skipped: result.skipped,
  failed: result.failed,
  durationMs: result.durationMs,
  tableCount: result.tableCount,
  errors: result.errors.map((error) => toSummaryError(error, env)),
});

type SyncMapCacheEntry = {
  id: string;
  targetRecordId: string | null;
  payloadHash: string | null;
};

const preloadSyncMaps = async (
  client: TwentyClientLike,
): Promise<Map<string, SyncMapCacheEntry>> => {
  const cache = new Map<string, SyncMapCacheEntry>();
  // Fetch all sync maps in a single large page. The REST client does not
  // support cursor-based pagination, so multi-page fetches would loop forever.
    const result = await client.query({
      xopureSyncMaps: {
      __args: { first: 1000 },
        edges: {
          node: {
            id: true,
            syncKey: true,
            targetRecordId: true,
            payloadHash: true,
          },
        },
          },
    });

    const connection = (result as Record<string, unknown>)?.xopureSyncMaps as
      | { edges?: Array<{ node?: Record<string, unknown> }> }
      | undefined;
    const edges = connection?.edges ?? [];

    for (const edge of edges) {
      const node = edge.node;
      if (node && typeof node.syncKey === 'string') {
        cache.set(node.syncKey, {
          id: String(node.id ?? ''),
          targetRecordId: (node.targetRecordId as string) ?? null,
          payloadHash: (node.payloadHash as string) ?? null,
        });
    }
  }

  return cache;
};

const wrapWithSyncMapCache = (
  inner: TwentyClientLike,
  cache: Map<string, SyncMapCacheEntry>,
): TwentyClientLike => ({
  query: async (queryBag: Record<string, unknown>) => {
    const fieldName = Object.keys(queryBag)[0];

    if (fieldName === 'xopureSyncMaps') {
      const args = ((queryBag as Record<string, { __args?: Record<string, unknown> }>).xopureSyncMaps?.__args ?? {}) as Record<string, unknown>;
      const filter = (args.filter ?? {}) as Record<string, Record<string, unknown>>;
      const filterKey = Object.keys(filter)[0];

      if (filterKey === 'syncKey' && filter[filterKey]?.eq !== undefined) {
        const syncKey = String(filter[filterKey].eq);
        const cached = cache.get(syncKey);

        return {
          xopureSyncMaps: {
            edges: cached
              ? [{ node: { id: cached.id, targetRecordId: cached.targetRecordId, payloadHash: cached.payloadHash } }]
              : [],
          },
        };
      }
    }

    return inner.query(queryBag);
  },

  mutation: async (mutationBag: Record<string, unknown>) => {
    const result = await inner.mutation(mutationBag);

    const mutationName = Object.keys(mutationBag)[0];
    if (mutationName === 'createXopureSyncMap' || mutationName === 'updateXopureSyncMap') {
      const args = ((mutationBag as Record<string, { __args?: Record<string, unknown> }>)[mutationName]?.__args ?? {}) as Record<string, unknown>;
      const data = (args.data ?? {}) as Record<string, unknown>;
      if (typeof data.syncKey === 'string') {
        const resultData = (result as Record<string, unknown>)?.[mutationName] as Record<string, unknown> | undefined;
        cache.set(data.syncKey, {
          id: (resultData?.id as string) ?? cache.get(data.syncKey)?.id ?? '',
          targetRecordId: (data.targetRecordId as string) ?? (resultData?.targetRecordId as string) ?? null,
          payloadHash: (data.payloadHash as string) ?? null,
        });
      }
    }

    return result;
  },
});

export const executeXopureBackfillCli = async (
  argv: string[],
  deps: ExecuteCliDeps = {},
): Promise<void> => {
  const env = deps.env ?? process.env;
  const args = parseArgs(argv);
  const requiredEnv = resolveRequiredEnv(env);
  const readSourceBatch = createSupabaseReaderFromAnyEnv(env);
  const client = createTwentyRestClient({
    apiUrl: requiredEnv.apiUrl,
    apiKey: requiredEnv.apiKey,
    ...(args.delayMs !== undefined && args.delayMs > 0
      ? { requestDelayMs: args.delayMs }
      : {}),
    ...(args.maxRetries !== undefined && args.maxRetries > 0
      ? { maxRetries: args.maxRetries }
      : {}),
  });

  // Pre-fetch all sync maps to eliminate per-record sync map lookup calls.
  // This cuts total API calls roughly in half for bulk syncs.
  // Use a separate client without delay/throttle so preload failures don't
  // corrupt the main sync's adaptive throttle state.
  const preloadClient = createTwentyRestClient({
    apiUrl: requiredEnv.apiUrl,
    apiKey: requiredEnv.apiKey,
  });
  let syncMapCache: Map<string, SyncMapCacheEntry> = new Map();
  try {
    syncMapCache = await preloadSyncMaps(preloadClient);
  } catch {
    // Preload may hit rate limits on first call — continue without cache.
  }
  const cachedClient = syncMapCache.size > 0
    ? wrapWithSyncMapCache(client, syncMapCache)
    : client;

  const result = await runXopureBackfill({
    readSourceBatch,
    client: cachedClient,
    dryRun: args.dryRun,
    ...(args.sourceTable ? { sourceTables: [args.sourceTable] } : {}),
  });
  const write = deps.write ?? ((chunk: string) => process.stdout.write(chunk));

  write(`${JSON.stringify(toSummaryResult(result, env), null, 2)}\n`);
};

const isExecutedDirectly = (): boolean => {
  if (!process.argv[1]) {
    return false;
  }

  return resolve(process.argv[1]) === fileURLToPath(import.meta.url);
};

if (isExecutedDirectly()) {
  executeXopureBackfillCli(process.argv.slice(2)).catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Unknown backfill CLI error';

    process.stderr.write(`${redactSecrets(message, process.env)}\n`);
    process.exit(1);
  });
}
