import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Pool } from 'pg';

import {
  discoverRawMirrorTables,
  readRawMirrorTableRows,
  runXopureRawMirrorDryRun,
  type RawMirrorDryRunResult,
} from '../raw-mirror/run-xopure-raw-mirror';

const SECRET_ENV_NAMES = ['XOPURE_SUPABASE_READONLY_DSN'];

type Env = Record<string, string | undefined>;

type CliArgs = {
  dryRun: boolean;
  sourceTable?: string;
  sourceSchema: string;
};

type ExecuteCliDeps = {
  env?: Env;
  write?: (chunk: string) => void;
};

type SummaryResult = Omit<RawMirrorDryRunResult, 'records'>;

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
  const args: CliArgs = { dryRun: true, sourceSchema: 'public' };

  for (const token of argv) {
    if (token === '--live') {
      args.dryRun = false;
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

const resolveDsn = (env: Env): string => {
  const dsn = firstNonEmpty(env.XOPURE_SUPABASE_READONLY_DSN);

  if (!dsn) {
    throw new Error('XOPURE_SUPABASE_READONLY_DSN is required for raw mirror DSN discovery.');
  }

  return dsn;
};

const toSummaryResult = (result: RawMirrorDryRunResult): SummaryResult => ({
  dryRun: result.dryRun,
  tableCount: result.tableCount,
  scanned: result.scanned,
  hashed: result.hashed,
  failed: result.failed,
  errors: result.errors,
});

export const executeXopureRawMirrorCli = async (
  argv: string[],
  deps: ExecuteCliDeps = {},
): Promise<void> => {
  const env = deps.env ?? process.env;
  const args = parseArgs(argv);

  if (!args.dryRun) {
    throw new Error('Raw mirror live mode is not implemented yet. Run without --live for dry-run hashing.');
  }

  const pool = new Pool({
    connectionString: resolveDsn(env),
    max: 5,
    options: '-c default_transaction_read_only=on',
  });

  const result = await runXopureRawMirrorDryRun({
    discoverTables: async () => {
      const tables = await discoverRawMirrorTables(pool, args.sourceSchema);

      return args.sourceTable
        ? tables.filter((table) => table.sourceTable === args.sourceTable)
        : tables;
    },
    readTableRows: (table) => readRawMirrorTableRows(pool, table),
  });

  const write = deps.write ?? ((chunk: string) => process.stdout.write(chunk));

  write(`${JSON.stringify(toSummaryResult(result), null, 2)}\n`);
};

const isExecutedDirectly = (): boolean => {
  if (!process.argv[1]) {
    return false;
  }

  return resolve(process.argv[1]) === fileURLToPath(import.meta.url);
};

if (isExecutedDirectly()) {
  executeXopureRawMirrorCli(process.argv.slice(2)).catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Unknown raw mirror CLI error';

    process.stderr.write(`${redactSecrets(message, process.env)}\n`);
    process.exit(1);
  });
}
