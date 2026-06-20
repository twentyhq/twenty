import type { TwentyClientLike } from 'src/supabase-sync/types/twenty-client-like.type';
import type { SupportedSourceTable } from 'src/supabase-sync/types/mapped-source-record.type';
import { getSourceTableMapping, type SourceTableMapping } from 'src/supabase-sync/constants/source-table-mapping';
import { BACKFILL_SOURCE_ORDER } from 'src/supabase-sync/backfill/backfill-runner';
import { runXopureBackfill } from 'src/supabase-sync/backfill/run-xopure-backfill';

type BackfillReader = (sourceTable: SupportedSourceTable) => Promise<Array<Record<string, unknown>>>;

type HandlerInput = {
  input: {
    sourceTable?: string;
    dryRun?: boolean;
  };
  client: TwentyClientLike;
  readSourceBatch: BackfillReader;
};

type HandlerOutput = {
  success: boolean;
  error?: { code: string };
  dryRun?: boolean;
  scanned?: number;
  mapped?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  failed?: number;
  tableCount?: number;
  durationMs?: number;
  completedAt?: string;
};

export async function handleSupabaseBackfillAction(
  params: HandlerInput,
): Promise<HandlerOutput> {
  const { input, client, readSourceBatch } = params;
  const dryRun = input.dryRun ?? true;
  const startedAt = Date.now();
  let mapping: SourceTableMapping | null = null;

  if (input.sourceTable) {
    mapping = getSourceTableMapping(input.sourceTable);
    if (!mapping) {
      return {
        success: false,
        error: { code: 'UNSUPPORTED_SOURCE_TABLE' },
      };
    }
  }

  const sourceTables: SupportedSourceTable[] = input.sourceTable
    ? [mapping!.sourceTable]
    : BACKFILL_SOURCE_ORDER;

  const result = await runXopureBackfill({
    sourceTables,
    readSourceBatch,
    client,
    dryRun,
  });

  return {
    success: true,
    dryRun: result.dryRun,
    scanned: result.scanned,
    mapped: result.mapped,
    created: result.created,
    updated: result.updated,
    skipped: result.skipped,
    failed: result.failed,
    tableCount: sourceTables.length,
    durationMs: Date.now() - startedAt,
    completedAt: new Date().toISOString(),
  };
}
