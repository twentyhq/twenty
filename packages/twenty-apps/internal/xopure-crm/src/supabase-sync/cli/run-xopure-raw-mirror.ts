import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Pool } from 'pg';

import {
  discoverRawMirrorTables,
  discoverRawMirrorRestTables,
  readRawMirrorTableRows,
  readRawMirrorRestTableRows,
  runXopureRawMirrorDryRun,
  runXopureRawMirrorLive,
  verifyRawMirrorParity,
  type RawMirrorDryRunResult,
  type RawMirrorLiveResult,
  type RawMirrorParityResult,
  type RawMirrorRestOptions,
  type RawMirrorTable,
} from '../raw-mirror/run-xopure-raw-mirror';

const SECRET_ENV_NAMES = [
  'XOPURE_SUPABASE_READONLY_DSN',
  'XOPURE_SUPABASE_READONLY_REST_URL',
  'XOPURE_SUPABASE_READONLY_REST_KEY',
  'TWENTY_DB_DSN',
];

type Env = Record<string, string | undefined>;

type CliArgs = {
  dryRun: boolean;
  verifyAll: boolean;
  sourceTable?: string;
  sourceSchema: string;
};

type ExecuteCliDeps = {
  env?: Env;
  write?: (chunk: string) => void;
};

type SummaryResult =
  | Omit<RawMirrorDryRunResult, 'records'>
  | RawMirrorLiveResult
  | RawMirrorParityResult;

type RawMirrorSource =
  | { kind: 'dsn'; dsn: string }
  | { kind: 'rest'; options: RawMirrorRestOptions };

type RawMirrorTargetEnv = {
  dsn: string;
  workspaceSchema: string;
};

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
  const args: CliArgs = { dryRun: true, verifyAll: false, sourceSchema: 'public' };

  for (const token of argv) {
    if (token === '--live') {
      args.dryRun = false;
      continue;
    }

    if (token === '--verify-all') {
      args.verifyAll = true;
      continue;
    }

    if (token.startsWith('--source-table=')) {
      const sourceTable = token.slice('--source-table='.length).trim();

      if (!sourceTable) {
        throw new Error('--source-table requires a non-empty table name.');
      }

      args.sourceTable = sourceTable;
      continue;
    }

    if (token.startsWith('--source-schema=')) {
      const sourceSchema = token.slice('--source-schema='.length).trim();

      if (!sourceSchema) {
        throw new Error('--source-schema requires a non-empty schema name.');
      }

      args.sourceSchema = sourceSchema;
      continue;
    }

    throw new Error(`Unsupported argument: ${token}`);
  }

  if (args.verifyAll && !args.dryRun) {
    throw new Error('--verify-all cannot be combined with --live.');
  }

  return args;
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

export const redactRawMirrorCliError = (error: unknown, env: Env): string => {
  const message =
    error instanceof Error ? error.message : 'Unknown raw mirror CLI error';

  return redactSecrets(message, env);
};

const resolveSource = (env: Env, sourceSchema: string): RawMirrorSource => {
  const dsn = firstNonEmpty(env.XOPURE_SUPABASE_READONLY_DSN);

  if (dsn) {
    return { kind: 'dsn', dsn };
  }

  const url = firstNonEmpty(env.XOPURE_SUPABASE_READONLY_REST_URL);
  const key = firstNonEmpty(env.XOPURE_SUPABASE_READONLY_REST_KEY);

  if (url && key) {
    return {
      kind: 'rest',
      options: {
        url,
        key,
        schema: sourceSchema,
      },
    };
  }

  throw new Error(
    'XOPURE_SUPABASE_READONLY_DSN or XOPURE_SUPABASE_READONLY_REST_URL/XOPURE_SUPABASE_READONLY_REST_KEY is required for raw mirror discovery.',
  );
};

const resolveTargetEnv = (env: Env): RawMirrorTargetEnv => {
  const dsn = firstNonEmpty(env.TWENTY_DB_DSN);

  if (!dsn) {
    throw new Error('TWENTY_DB_DSN is required for raw mirror live mode.');
  }

  const workspaceSchema = firstNonEmpty(env.TWENTY_WORKSPACE_SCHEMA);

  if (!workspaceSchema) {
    throw new Error('TWENTY_WORKSPACE_SCHEMA is required for raw mirror live mode.');
  }

  return { dsn, workspaceSchema };
};

const toSummaryResult = (
  result: RawMirrorDryRunResult | RawMirrorLiveResult | RawMirrorParityResult,
): SummaryResult => {
  if ('dryRun' in result && result.dryRun) {
    return {
      dryRun: result.dryRun,
      tableCount: result.tableCount,
      scanned: result.scanned,
      hashed: result.hashed,
      failed: result.failed,
      errors: result.errors,
    };
  }

  return result;
};

const writeSummary = (
  result: RawMirrorDryRunResult | RawMirrorLiveResult | RawMirrorParityResult,
  write: (chunk: string) => void,
): void => {
  write(`${JSON.stringify(toSummaryResult(result), null, 2)}\n`);
};

export const executeXopureRawMirrorCli = async (
  argv: string[],
  deps: ExecuteCliDeps = {},
): Promise<void> => {
  const env = deps.env ?? process.env;
  const args = parseArgs(argv);
  const source = resolveSource(env, args.sourceSchema);
  const sourceInput =
    source.kind === 'rest'
      ? {
          discoverTables: async () => {
            const tables = await discoverRawMirrorRestTables(source.options);

            return args.sourceTable
              ? tables.filter((table) => table.sourceTable === args.sourceTable)
              : tables;
          },
          readTableRows: (table: RawMirrorTable) =>
            readRawMirrorRestTableRows(source.options, table),
        }
      : (() => {
          const pool = new Pool({
            connectionString: source.dsn,
            max: 5,
          });

          return {
            discoverTables: async () => {
              const tables = await discoverRawMirrorTables(pool, args.sourceSchema);

              return args.sourceTable
                ? tables.filter((table) => table.sourceTable === args.sourceTable)
                : tables;
            },
            readTableRows: (table: RawMirrorTable) =>
              readRawMirrorTableRows(pool, table),
          };
        })();
  const write = deps.write ?? ((chunk: string) => process.stdout.write(chunk));

  if (args.verifyAll) {
    const targetEnv = resolveTargetEnv(env);
    const targetPool = new Pool({
      connectionString: targetEnv.dsn,
      max: 1,
    });
    const targetClient = await targetPool.connect();

    try {
      const result = await verifyRawMirrorParity({
        ...sourceInput,
        target: {
          client: targetClient,
          workspaceSchema: targetEnv.workspaceSchema,
        },
      });

      writeSummary(result, write);
    } finally {
      targetClient.release();
      await targetPool.end();
    }
    return;
  }

  if (args.dryRun) {
    const result = await runXopureRawMirrorDryRun(sourceInput);

    writeSummary(result, write);
    return;
  }

  const targetEnv = resolveTargetEnv(env);
  const targetPool = new Pool({
    connectionString: targetEnv.dsn,
    max: 1,
  });
  const targetClient = await targetPool.connect();

  try {
    await targetClient.query('BEGIN');
    const result = await runXopureRawMirrorLive({
      ...sourceInput,
      target: {
        client: targetClient,
        workspaceSchema: targetEnv.workspaceSchema,
      },
    });
    await targetClient.query('COMMIT');

    writeSummary(result, write);
  } catch (error) {
    await targetClient.query('ROLLBACK');
    throw error;
  } finally {
    targetClient.release();
    await targetPool.end();
  }
};

const isExecutedDirectly = (): boolean => {
  if (!process.argv[1]) {
    return false;
  }

  return resolve(process.argv[1]) === fileURLToPath(import.meta.url);
};

if (isExecutedDirectly()) {
  executeXopureRawMirrorCli(process.argv.slice(2)).catch((error: unknown) => {
    process.stderr.write(`${redactRawMirrorCliError(error, process.env)}\n`);
    process.exit(1);
  });
}
