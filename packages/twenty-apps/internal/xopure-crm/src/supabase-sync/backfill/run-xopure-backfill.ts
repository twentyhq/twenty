import type {
  MappingError,
  MappedSourceRecord,
  SupportedSourceTable,
} from '../types/mapped-source-record.type';
import type { TwentyClientLike } from '../types/twenty-client-like.type';
import { mapSupabaseRecords } from '../utils/map-supabase-record';
import { upsertTwentyRecord } from '../utils/upsert-twenty-record';
import {
  BACKFILL_SOURCE_ORDER,
  runXopureBackfillDryRun,
} from './backfill-runner';

type BackfillReader = (
  sourceTable: SupportedSourceTable,
) => Promise<Array<Record<string, unknown>>>;

export type BackfillErrorEntry = {
  sourceTable: string;
  sourceRecordId: string;
  targetObject?: string;
  error: string;
};

export type BackfillInput = {
  sourceTables?: SupportedSourceTable[];
  sourceSchema?: string;
  readSourceBatch: BackfillReader;
  client: TwentyClientLike;
  dryRun?: boolean;
};

export type BackfillResult = {
  dryRun: boolean;
  scanned: number;
  mapped: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  durationMs: number;
  tableCount: number;
  records?: MappedSourceRecord[];
  errors: (MappingError | BackfillErrorEntry)[];
};

const orderSourceTables = (
  sourceTables?: SupportedSourceTable[],
): SupportedSourceTable[] => {
  const resolved: SupportedSourceTable[] =
    sourceTables !== undefined && sourceTables.length > 0
      ? sourceTables
      : [...BACKFILL_SOURCE_ORDER];

  const requested = new Set(resolved);

  return BACKFILL_SOURCE_ORDER.filter((sourceTable) =>
    requested.has(sourceTable),
  );
};

const sanitizeError = (
  sourceTable: string,
  sourceRecordId: string,
  targetObject: string | undefined,
  error: string,
): BackfillErrorEntry => {
  const entry: BackfillErrorEntry = {
    sourceTable,
    sourceRecordId,
    error,
  };

  if (targetObject !== undefined) {
    entry.targetObject = targetObject;
  }

  return entry;
};

export const runXopureBackfill = async (
  input: BackfillInput,
): Promise<BackfillResult> => {
  const dryRun = input.dryRun !== false;
  const startTime = Date.now();
  const sourceTables = orderSourceTables(input.sourceTables);
  const tableCount = sourceTables.length;

  if (dryRun) {
    const dryRunResult = await runXopureBackfillDryRun({
      sourceTables: input.sourceTables,
      sourceSchema: input.sourceSchema,
      readSourceBatch: input.readSourceBatch,
      client: input.client,
    });

    const durationMs = Date.now() - startTime;

    return {
      dryRun: true,
      scanned: dryRunResult.scanned,
      mapped: dryRunResult.mapped,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: dryRunResult.failed,
      durationMs,
      tableCount,
      records: dryRunResult.records,
      errors: dryRunResult.errors,
    };
  }

  // Live mode
  const errors: BackfillErrorEntry[] = [];
  const sourceSchema = input.sourceSchema ?? 'public';
  let scanned = 0;
  let mapped = 0;
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const sourceTable of sourceTables) {
    const sourceRows = await input.readSourceBatch(sourceTable);

    for (const sourceRow of sourceRows) {
      scanned += 1;

      const mappingResults = mapSupabaseRecords({
        eventType: 'BACKFILL',
        sourceSchema,
        sourceTable,
        record: sourceRow,
      });

      for (const mappingResult of mappingResults) {
        if (!mappingResult.ok) {
          failed += 1;
          errors.push(
            sanitizeError(
              mappingResult.sourceTable,
              mappingResult.sourceRecordId ?? '',
              undefined,
              mappingResult.message,
            ),
          );

          continue;
        }

        mapped += 1;
        const record = mappingResult.record;

        try {
          const upsertResult = await upsertTwentyRecord(input.client, record);

          switch (upsertResult.action) {
            case 'created': {
              created += 1;

              break;
            }
            case 'updated': {
              updated += 1;

              break;
            }
            case 'skipped': {
              skipped += 1;

              break;
            }
            case 'failed': {
              failed += 1;
              errors.push(
                sanitizeError(
                  sourceTable,
                  record.sourceRecordId,
                  upsertResult.targetObject,
                  upsertResult.errorMessage ??
                    upsertResult.errorCode ??
                    'Upsert failed',
                ),
              );

              break;
            }
          }
        } catch (err) {
          failed += 1;
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Unknown error during upsert';
          errors.push(
            sanitizeError(
              sourceTable,
              record.sourceRecordId,
              record.targetObject,
              errorMessage,
            ),
          );
        }
      }
    }
  }

  const durationMs = Date.now() - startTime;

  return {
    dryRun: false,
    scanned,
    mapped,
    created,
    updated,
    skipped,
    failed,
    durationMs,
    tableCount,
    errors,
  };
};
