import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getSourceTableMapping } from 'src/supabase-sync/constants/source-table-mapping';
import { createSupabaseReaderFromAnyEnv } from 'src/supabase-sync/backfill/read-supabase-rest-source';
import { runXopureBackfill } from 'src/supabase-sync/backfill/run-xopure-backfill';
import type { SupportedSourceTable } from 'src/supabase-sync/types/mapped-source-record.type';

type Input = {
  dryRun?: boolean;
  sourceTable?: string;
};

type Output = {
  dryRun: boolean;
  scanned: number;
  mapped: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  tableCount: number;
  durationMs: number;
  completedAt: string;
};

export const handler = async (input: Input = {}): Promise<Output> => {
  const dryRun = input.dryRun ?? false;
  let sourceTables: SupportedSourceTable[] | undefined;

  if (input.sourceTable) {
    const mapping = getSourceTableMapping(input.sourceTable);

    if (!mapping) {
      throw new Error(`Unsupported Supabase source table: ${input.sourceTable}`);
    }

    sourceTables = [mapping.sourceTable];
  }

  const client = new CoreApiClient();
  const readSourceBatch = createSupabaseReaderFromAnyEnv(process.env);
  const result = await runXopureBackfill({
    client,
    readSourceBatch,
    dryRun,
    ...(sourceTables ? { sourceTables } : {}),
  });

  return {
    dryRun: result.dryRun,
    scanned: result.scanned,
    mapped: result.mapped,
    created: result.created,
    updated: result.updated,
    skipped: result.skipped,
    failed: result.failed,
    tableCount: result.tableCount,
    durationMs: result.durationMs,
    completedAt: new Date().toISOString(),
  };
};

export default defineLogicFunction({
  universalIdentifier: '28540047-d813-4c2d-9b9a-9a6e9a1c166f',
  name: 'supabase-reconciliation-schedule',
  description: 'Scheduled safety net that backfills Supabase records into Twenty through the read-only source path.',
  timeoutSeconds: 300,
  handler,
  cronTriggerSettings: {
    pattern: '0 * * * *',
  },
  workflowActionTriggerSettings: {
    label: 'Supabase Reconciliation Schedule Scheduled Run',
    icon: 'IconClock',
    inputSchema: [
      {
        type: 'object',
        properties: {
          dryRun: { type: 'boolean' },
          sourceTable: { type: 'string' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          dryRun: { type: 'boolean' },
          scanned: { type: 'number' },
          mapped: { type: 'number' },
          created: { type: 'number' },
          updated: { type: 'number' },
          skipped: { type: 'number' },
          failed: { type: 'number' },
          tableCount: { type: 'number' },
          durationMs: { type: 'number' },
          completedAt: { type: 'string' },
        },
      },
    ],
  },
});
