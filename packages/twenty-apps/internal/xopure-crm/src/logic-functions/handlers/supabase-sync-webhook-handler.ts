import type { SupabaseWebhookPayload } from '../types/supabase-webhook-payload.type';
import type { UpsertResult } from 'src/supabase-sync/types/mapped-source-record.type';
import type { TwentyClientLike } from 'src/supabase-sync/types/twenty-client-like.type';
import {
  getSafeSourceRecordId,
  mapSupabaseRecords,
} from 'src/supabase-sync/utils/map-supabase-record';
import { upsertTwentyRecord } from 'src/supabase-sync/utils/upsert-twenty-record';

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

const parsePayload = (body: unknown): SupabaseWebhookPayload | null => {
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as unknown;
      return isRecord(parsed) ? (parsed as SupabaseWebhookPayload) : null;
    } catch {
      return null;
    }
  }

  return isRecord(body) ? (body as SupabaseWebhookPayload) : null;
};

export const handleSupabaseSyncWebhook = async (
  input: HandlerInput,
): Promise<HandlerResponse> => {
  const expectedSecret = input.expectedSecret;
  const providedSecret = getHeader(input.event.headers, 'x-xopure-sync-secret');

  if (expectedSecret && providedSecret !== expectedSecret) {
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

  const payload = parsePayload(input.event.body);

  if (!payload || !payload.table || !payload.record) {
    return {
      statusCode: 400,
      body: {
        ok: false,
        error: {
          code: 'MALFORMED_PAYLOAD',
          message: 'Supabase webhook payload must include table and record.',
          retryable: false,
        },
      },
    };
  }

  const record = payload.record;
  const sourceRecordId =
    getSafeSourceRecordId(record) ?? getSafeSourceRecordId(payload.old_record);
  const mappingResults = mapSupabaseRecords({
    eventType: payload.type ?? 'UNKNOWN',
    sourceSchema: payload.schema ?? 'public',
    sourceTable: payload.table,
    record,
  });
  const firstMappingError = mappingResults.find((result) => !result.ok);

  if (firstMappingError && !firstMappingError.ok) {
    if (firstMappingError.code === 'UNSUPPORTED_SOURCE_TABLE') {
      return {
        statusCode: 202,
        body: {
          ok: true,
          status: 'skipped',
          skipped: 1,
          error: firstMappingError,
        },
      };
    }

    return {
      statusCode: 400,
      body: {
        ok: false,
        status: 'failed',
        failed: 1,
        error: firstMappingError,
      },
    };
  }

  const mappedRecords = mappingResults.flatMap((result) =>
    result.ok ? [result.record] : [],
  );
  const upsertResults: UpsertResult[] = [];

  for (const mappedRecord of mappedRecords) {
    upsertResults.push(await upsertTwentyRecord(input.client, mappedRecord));
  }

  const failedUpsertResult = upsertResults.find(
    (upsertResult) => upsertResult.action === 'failed',
  );

  if (failedUpsertResult) {
    console.warn('xopure_supabase_sync_row_failed', {
      sourceTable: payload.table,
      sourceRecordId,
      targetObject: failedUpsertResult.targetObject,
      errorCode: failedUpsertResult.errorCode,
      retryable: failedUpsertResult.retryable,
    });

    return {
      statusCode: failedUpsertResult.retryable ? 409 : 400,
      body: {
        ok: false,
        status: 'failed',
        created: upsertResults.filter(
          (upsertResult) => upsertResult.action === 'created',
        ).length,
        updated: upsertResults.filter(
          (upsertResult) => upsertResult.action === 'updated',
        ).length,
        skipped: upsertResults.filter(
          (upsertResult) => upsertResult.action === 'skipped',
        ).length,
        failed: 1,
        sourceTable: payload.table,
        sourceRecordId,
        targetObject: failedUpsertResult.targetObject,
        syncMapId: failedUpsertResult.syncMapId,
        error: {
          code: failedUpsertResult.errorCode,
          message: failedUpsertResult.errorMessage,
          retryable: failedUpsertResult.retryable,
        },
      },
    };
  }

  for (const [index, upsertResult] of upsertResults.entries()) {
    const mappedRecord = mappedRecords[index];

    console.info('xopure_supabase_sync_row_processed', {
      sourceTable: mappedRecord?.sourceTable,
      sourceRecordId: mappedRecord?.sourceRecordId,
      targetObject: upsertResult.targetObject,
      action: upsertResult.action,
    });
  }

  const created = upsertResults.filter(
    (upsertResult) => upsertResult.action === 'created',
  ).length;
  const updated = upsertResults.filter(
    (upsertResult) => upsertResult.action === 'updated',
  ).length;
  const skipped = upsertResults.filter(
    (upsertResult) => upsertResult.action === 'skipped',
  ).length;
  const primaryUpsertResult = upsertResults[0];

  return {
    statusCode: 200,
    body: {
      ok: true,
      status:
        upsertResults.length === 1
          ? primaryUpsertResult?.action
          : 'processed',
      created,
      updated,
      skipped,
      failed: 0,
      sourceTable: mappedRecords[0]?.sourceTable,
      sourceRecordId: mappedRecords[0]?.sourceRecordId,
      targetObject: primaryUpsertResult?.targetObject,
      targetObjects: upsertResults.map((upsertResult) => upsertResult.targetObject),
      twentyRecordId: primaryUpsertResult?.twentyRecordId,
      syncMapId: primaryUpsertResult?.syncMapId,
    },
  };
};
