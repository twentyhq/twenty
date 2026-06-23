import { resolve } from 'node:path';

import { Pool } from 'pg';
import type { PoolClient } from 'pg';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InstallTriggerDbCliResult = {
  functionName: string;
  triggerName: string;
  functionCreated: boolean;
  triggerCreated: boolean;
  backfillInserted: number;
};

type InstallTriggerDbCliArgs = Record<string, never>;
type QueryRowsResult = {
  rows?: { count?: number | string }[];
};

type ParseCliArgsResult =
  | { success: true; args: InstallTriggerDbCliArgs }
  | { success: false; error: string };

type ExecuteCliDeps = {
  env?: Record<string, string | undefined>;
  createPool?: (connectionString: string) => Pool;
  write?: (chunk: string) => void;
  exitProcess?: (code: number) => void;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const quoteIdentifier = (identifier: string): string => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error('Invalid SQL identifier: '.concat(identifier));
  }

  return '"'.concat(identifier, '"');
};

const quoteTable = (schema: string, table: string): string =>
  quoteIdentifier(schema).concat('.', quoteIdentifier(table));

const resolveWorkspaceSchema = (
  env: Record<string, string | undefined>,
): string => {
  const workspaceSchema = env.TWENTY_WORKSPACE_SCHEMA;

  if (!workspaceSchema) {
    throw new Error('Missing TWENTY_WORKSPACE_SCHEMA environment variable');
  }

  if (!/^workspace_[a-z0-9]+$/.test(workspaceSchema)) {
    throw new Error(
      'TWENTY_WORKSPACE_SCHEMA must match workspace_<base36>, received '.concat(workspaceSchema),
    );
  }

  return workspaceSchema;
};

const resolveDbDsn = (env: Record<string, string | undefined>): string => {
  const dsn = env.TWENTY_DB_DSN;

  if (!dsn) {
    throw new Error('Missing TWENTY_DB_DSN environment variable');
  }

  return dsn;
};

const defaultCreatePool = (connectionString: string): Pool =>
  new Pool({ connectionString, max: 1 });

// ---------------------------------------------------------------------------
// SQL Builder (pure function, testable without a live DB)
// ---------------------------------------------------------------------------

export const buildSupportTicketTaskTriggerSql = (
  workspaceSchema: string,
): string => {
  const tkt = quoteTable(workspaceSchema, '_xopureSupportTicket');
  const task = quoteTable(workspaceSchema, 'task');
  const tgt = quoteTable(workspaceSchema, 'taskTarget');
  const qws = quoteIdentifier(workspaceSchema);

  const lines: string[] = [];

  // -- Trigger function --
  lines.push('-- Trigger: auto-create Task + TaskTarget for _xopureSupportTicket INSERT');
  lines.push('-- Idempotent: skips rows where a non-deleted taskTarget already exists.');
  lines.push('');
  lines.push('CREATE OR REPLACE FUNCTION '.concat(qws, '.xopure_support_ticket_task_creator()'));
  lines.push('RETURNS TRIGGER');
  lines.push('LANGUAGE plpgsql');
  lines.push('AS $$');
  lines.push('DECLARE');
  lines.push('  v_task_id UUID;');
  lines.push('BEGIN');
  lines.push('  IF NEW."deletedAt" IS NOT NULL THEN');
  lines.push('    RETURN NEW;');
  lines.push('  END IF;');
  lines.push('');
  lines.push('  IF EXISTS (');
  lines.push('    SELECT 1 FROM '.concat(tgt));
  lines.push('    WHERE "targetXopureSupportTicketId" = NEW."id"');
  lines.push('      AND "deletedAt" IS NULL');
  lines.push('  ) THEN');
  lines.push('    RETURN NEW;');
  lines.push('  END IF;');
  lines.push('');
  lines.push('  INSERT INTO '.concat(task, ' ('));
  lines.push('    title,');
  lines.push('    "bodyV2Markdown",');
  lines.push('    "dueAt",');
  lines.push('    status,');
  lines.push('    "createdBySource",');
  lines.push('    "createdByWorkspaceMemberId",');
  lines.push('    "createdByName",');
  lines.push('    "createdByContext",');
  lines.push('    "updatedBySource",');
  lines.push('    "updatedByWorkspaceMemberId",');
  lines.push('    "updatedByName",');
  lines.push('    "updatedByContext"');
  lines.push('  )');
  lines.push('  VALUES (');
  lines.push("    'Follow up on support ticket: ' || COALESCE(NEW.subject, NEW.\"ticketNumber\", NEW.id::text),");
  lines.push("    'Auto-created from support ticket ' || COALESCE(NEW.\"ticketNumber\", NEW.id::text),");
  lines.push("    NOW() + INTERVAL '2 days',");
  lines.push("    'TODO',");
  lines.push("    'SYSTEM',");
  lines.push('    NULL,');
  lines.push("    'System',");
  lines.push("    '{}'::jsonb,");
  lines.push("    'SYSTEM',");
  lines.push('    NULL,');
  lines.push("    'System',");
  lines.push("    '{}'::jsonb");
  lines.push('  ) RETURNING id INTO v_task_id;');
  lines.push('');
  lines.push('  INSERT INTO '.concat(tgt, ' ('));
  lines.push('    "taskId",');
  lines.push('    "targetXopureSupportTicketId",');
  lines.push('    "createdBySource",');
  lines.push('    "createdByWorkspaceMemberId",');
  lines.push('    "createdByName",');
  lines.push('    "createdByContext",');
  lines.push('    "updatedBySource",');
  lines.push('    "updatedByWorkspaceMemberId",');
  lines.push('    "updatedByName",');
  lines.push('    "updatedByContext"');
  lines.push('  )');
  lines.push('  VALUES (');
  lines.push('    v_task_id,');
  lines.push('    NEW."id",');
  lines.push("    'SYSTEM',");
  lines.push('    NULL,');
  lines.push("    'System',");
  lines.push("    '{}'::jsonb,");
  lines.push("    'SYSTEM',");
  lines.push('    NULL,');
  lines.push("    'System',");
  lines.push("    '{}'::jsonb");
  lines.push('  );');
  lines.push('');
  lines.push('  RETURN NEW;');
  lines.push('END;');
  lines.push('$$;');
  lines.push('');
  // -- Trigger DDL --
  lines.push('DROP TRIGGER IF EXISTS xopure_support_ticket_task_creator_after_insert ON '.concat(tkt, ';'));
  lines.push('CREATE TRIGGER xopure_support_ticket_task_creator_after_insert');
  lines.push('  AFTER INSERT ON '.concat(tkt));
  lines.push('  FOR EACH ROW');
  lines.push('  EXECUTE FUNCTION '.concat(qws, '.xopure_support_ticket_task_creator();'));
  lines.push('');
  // -- Backfill via CTE chain with RETURNING for exact count --
  lines.push('WITH backfill_tickets AS (');
  lines.push('  SELECT');
  lines.push('    st."id" AS ticket_id,');
  lines.push('    COALESCE(st."subject", st."ticketNumber", st."id"::text) AS ticket_subject,');
  lines.push('    COALESCE(st."ticketNumber", st."id"::text) AS ticket_identifier');
  lines.push('  FROM '.concat(tkt, ' st'));
  lines.push('  WHERE st."deletedAt" IS NULL');
  lines.push('    AND NOT EXISTS (');
  lines.push('      SELECT 1 FROM '.concat(tgt, ' tt'));
  lines.push('      WHERE tt."targetXopureSupportTicketId" = st."id"');
  lines.push('        AND tt."deletedAt" IS NULL');
  lines.push('    )');
  lines.push('),');
  lines.push('generated AS (');
  lines.push('  SELECT');
  lines.push('    gen_random_uuid() AS task_id,');
  lines.push('    bt.ticket_id,');
  lines.push('    bt.ticket_subject,');
  lines.push('    bt.ticket_identifier');
  lines.push('  FROM backfill_tickets bt');
  lines.push('),');
  lines.push('inserted_tasks AS (');
  lines.push('  INSERT INTO '.concat(task, ' ('));
  lines.push('    "id",');
  lines.push('    title,');
  lines.push('    "bodyV2Markdown",');
  lines.push('    "dueAt",');
  lines.push('    status,');
  lines.push('    "createdBySource",');
  lines.push('    "createdByWorkspaceMemberId",');
  lines.push('    "createdByName",');
  lines.push('    "createdByContext",');
  lines.push('    "updatedBySource",');
  lines.push('    "updatedByWorkspaceMemberId",');
  lines.push('    "updatedByName",');
  lines.push('    "updatedByContext"');
  lines.push('  )');
  lines.push('  SELECT');
  lines.push('    g.task_id,');
  lines.push("    'Follow up on support ticket: ' || g.ticket_subject,");
  lines.push("    'Auto-created from support ticket ' || g.ticket_identifier,");
  lines.push("    NOW() + INTERVAL '2 days',");
  lines.push("    'TODO',");
  lines.push("    'SYSTEM',");
  lines.push('    NULL,');
  lines.push("    'System',");
  lines.push("    '{}'::jsonb,");
  lines.push("    'SYSTEM',");
  lines.push('    NULL,');
  lines.push("    'System',");
  lines.push("    '{}'::jsonb");
  lines.push('  FROM generated g');
  lines.push('  RETURNING id');
  lines.push('),');
  lines.push('inserted_targets AS (');
  lines.push('  INSERT INTO '.concat(tgt, ' ('));
  lines.push('    "taskId",');
  lines.push('    "targetXopureSupportTicketId",');
  lines.push('    "createdBySource",');
  lines.push('    "createdByWorkspaceMemberId",');
  lines.push('    "createdByName",');
  lines.push('    "createdByContext",');
  lines.push('    "updatedBySource",');
  lines.push('    "updatedByWorkspaceMemberId",');
  lines.push('    "updatedByName",');
  lines.push('    "updatedByContext"');
  lines.push('  )');
  lines.push('  SELECT');
  lines.push('    g.task_id,');
  lines.push('    g.ticket_id,');
  lines.push("    'SYSTEM',");
  lines.push('    NULL,');
  lines.push("    'System',");
  lines.push("    '{}'::jsonb,");
  lines.push("    'SYSTEM',");
  lines.push('    NULL,');
  lines.push("    'System',");
  lines.push("    '{}'::jsonb");
  lines.push('  FROM generated g');
  lines.push('  RETURNING id');
  lines.push(')');
  lines.push('SELECT COUNT(*)::text FROM inserted_targets;');
  lines.push('');

  return lines.join('\n');
};

const extractBackfillInserted = (
  queryResult: QueryRowsResult | QueryRowsResult[],
): number => {
  const result = Array.isArray(queryResult)
    ? queryResult[queryResult.length - 1]
    : queryResult;
  const rawCount = result?.rows?.[0]?.count ?? '0';
  const parsedCount = Number.parseInt(String(rawCount), 10);

  return Number.isNaN(parsedCount) ? 0 : parsedCount;
};

// ---------------------------------------------------------------------------
// CLI Execution
// ---------------------------------------------------------------------------

const parseInstallTriggerDbCliArgs = (
  _argv: string[],
): ParseCliArgsResult => {
  return { success: true, args: {} };
};

export const executeSupportTicketTaskTriggerDbCli = async (
  argv: string[],
  deps: ExecuteCliDeps = {},
): Promise<void> => {
  const env = deps.env ?? process.env;
  const write: (chunk: string) => void =
    deps.write ?? process.stdout.write.bind(process.stdout);
  const createPool = deps.createPool ?? defaultCreatePool;

  const parsed = parseInstallTriggerDbCliArgs(argv);

  if (!parsed.success) {
    write(JSON.stringify({ error: parsed.error }).concat('\n'));
    const exitProcess = deps.exitProcess ?? process.exit.bind(process);
    exitProcess(1);
    return;
  }

  const workspaceSchema = resolveWorkspaceSchema(env);
  const dsn = resolveDbDsn(env);

  const sql = buildSupportTicketTaskTriggerSql(workspaceSchema);
  const functionName = 'xopure_support_ticket_task_creator';
  const triggerName = 'xopure_support_ticket_task_creator_after_insert';

  const pool = createPool(dsn);
  const client: PoolClient = await pool.connect();

  try {
    await client.query('BEGIN');

    const countResult = (await client.query(sql)) as unknown as
      | QueryRowsResult
      | QueryRowsResult[];

    await client.query('COMMIT');

    const backfillInserted = extractBackfillInserted(countResult);

    const result: InstallTriggerDbCliResult = {
      functionName,
      triggerName,
      functionCreated: true,
      triggerCreated: true,
      backfillInserted,
    };

    write(JSON.stringify(result).concat('\n'));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// ---------------------------------------------------------------------------
// Direct execution guard
// ---------------------------------------------------------------------------

const isExecutedDirectly = (): boolean => {
  const mainModuleUrl = process.argv[1];

  if (typeof mainModuleUrl !== 'string') {
    return false;
  }

  return resolve(mainModuleUrl).endsWith('install-support-ticket-task-trigger-db.ts');
};

if (isExecutedDirectly()) {
  executeSupportTicketTaskTriggerDbCli(process.argv.slice(2)).catch(
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(message.concat('\n'));
      process.exit(1);
    },
  );
}
