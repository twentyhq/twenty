import type { TwentyClientLike } from 'src/supabase-sync/types/twenty-client-like.type';
import type {
  MappingError,
  SupportedSourceTable,
} from 'src/supabase-sync/types/mapped-source-record.type';

import { runXopureBackfillDryRun } from 'src/supabase-sync/backfill/backfill-runner';
import { getSourceTableMapping } from 'src/supabase-sync/constants/source-table-mapping';
import {
  getSafeSourceRecordId,
  mapSupabaseRecord,
} from 'src/supabase-sync/utils/map-supabase-record';
import { upsertTwentyRecord } from 'src/supabase-sync/utils/upsert-twenty-record';

type BackfillRequest = {
  table: string;
  records: Array<Record<string, unknown>>;
  dryRun?: boolean;
};

type BackfillErrorEntry = {
  sourceRecordId: string;
  error: string;
};

export type BackfillResponse = {
  ok: boolean;
  dryRun: boolean;
  table: string;
  scanned: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<BackfillErrorEntry>;
  durationMs: number;
};

type WebhookEvent = {
  headers: Record<string, string | undefined>;
  body?: unknown;
};

type HandlerInput = {
  event: WebhookEvent;
  expectedSecret?: string;
  client: TwentyClientLike;
};

type HandlerResponse = {
  statusCode: number;
  body: Record<string, unknown>;
};

const getHeader = (
  headers: Record<string, string | undefined>,
  name: string,
): string | undefined => {
  const direct = headers[name];

  if (direct) {
    return direct;
  }

  const lowerName = name.toLowerCase();
  const matchingEntry = Object.entries(headers).find(
    ([headerName]) => headerName.toLowerCase() === lowerName,
  );

  return matchingEntry?.[1];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseRequest = (body: unknown): BackfillRequest | null => {
  let parsed: unknown = body;

  if (typeof body === 'string') {
    try {
      parsed = JSON.parse(body);
    } catch {
      return null;
    }
  }

  if (!isRecord(parsed)) {
    return null;
  }

  const table = parsed.table;
  const records = parsed.records;
  const dryRun = parsed.dryRun;

  if (typeof table !== 'string' || table.length === 0) {
    return null;
  }

  if (!Array.isArray(records)) {
    return null;
  }

  return {
    table,
    records,
    dryRun: dryRun === true,
  };
};

const resolveSourceTable = (
  table: string,
): SupportedSourceTable | null => {
  const mapping = getSourceTableMapping(table);

  return mapping?.sourceTable ?? null;
};

export const handleSyncBackfill = async (
  input: HandlerInput,
): Promise<HandlerResponse> => {
  const startedAt = Date.now();

  const expectedSecret = input.expectedSecret?.trim();
  const providedSecret = getHeader(input.event.headers, 'x-xopure-sync-secret');

  if (!expectedSecret) {
    return {
      statusCode: 500,
      body: {
        ok: false,
        error: {
          code: 'SYNC_SECRET_NOT_CONFIGURED',
          message:
            'Sync secret is not configured. Refusing to process request.',
          retryable: true,
        },
      },
    };
  }

  if (providedSecret !== expectedSecret) {
    return {
      statusCode: 401,
      body: {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
          retryable: false,
        },
      },
    };
  }

  const request = parseRequest(input.event.body);

  if (!request) {
    return {
      statusCode: 400,
      body: {
        ok: false,
        error: {
          code: 'MALFORMED_PAYLOAD',
          message:
            'Request body must include a non-empty "table" string and a "records" array.',
          retryable: false,
        },
      },
    };
  }

  const sourceTable = resolveSourceTable(request.table);

  if (!sourceTable) {
    return {
      statusCode: 400,
      body: {
        ok: false,
        error: {
          code: 'UNSUPPORTED_SOURCE_TABLE',
          message: `Table "${request.table}" is not a supported source table.`,
          retryable: false,
        },
      },
    };
  }

  if (request.dryRun) {
    const dryRunResult = await runXopureBackfillDryRun({
      sourceTables: [sourceTable],
      readSourceBatch: async () => request.records,
      client: input.client,
    });

    const response: BackfillResponse = {
      ok: true,
      dryRun: true,
      table: sourceTable,
      scanned: dryRunResult.scanned,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: dryRunResult.failed,
      errors: dryRunResult.errors.map((error: MappingError) => ({
        sourceRecordId: error.sourceRecordId ?? 'unknown',
        error: error.message,
      })),
      durationMs: Date.now() - startedAt,
    };

    return {
      statusCode: 200,
      body: response,
    };
  }

  // Live mode: map and upsert each record individually.
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const errors: Array<BackfillErrorEntry> = [];

  for (const record of request.records) {
    const sourceRecordId = getSafeSourceRecordId(record);

    const mappingResult = mapSupabaseRecord({
      eventType: 'BACKFILL',
      sourceSchema: 'public',
      sourceTable,
      record,
    });

    if (!mappingResult.ok) {
      failed += 1;
      errors.push({
        sourceRecordId: sourceRecordId ?? 'unknown',
        error: mappingResult.message,
      });
      continue;
    }

    try {
      const upsertResult = await upsertTwentyRecord(
        input.client,
        mappingResult.record,
      );

      switch (upsertResult.action) {
        case 'created':
          created += 1;
          break;
        case 'updated':
          updated += 1;
          break;
        case 'skipped':
          skipped += 1;
          break;
        case 'failed':
          failed += 1;
          errors.push({
            sourceRecordId: sourceRecordId ?? 'unknown',
            error: upsertResult.errorMessage ?? 'Unknown upsert error',
          });
          break;
      }
    } catch (error) {
      failed += 1;
      errors.push({
        sourceRecordId: sourceRecordId ?? 'unknown',
        error: error instanceof Error ? error.message : 'Unexpected error during upsert.',
      });
    }
  }

  console.info('xopure_backfill_completed', {
    table: sourceTable,
    scanned: request.records.length,
    created,
    updated,
    skipped,
    failed,
    durationMs: Date.now() - startedAt,
  });

  const response: BackfillResponse = {
    ok: failed === 0,
    dryRun: false,
    table: sourceTable,
    scanned: request.records.length,
    created,
    updated,
    skipped,
    failed,
    errors,
    durationMs: Date.now() - startedAt,
  };

  return {
    statusCode: failed > 0 ? 207 : 200,
    body: response,
  };
};
