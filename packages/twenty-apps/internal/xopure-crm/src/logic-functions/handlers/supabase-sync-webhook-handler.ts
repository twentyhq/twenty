import type { SupabaseWebhookPayload } from '../types/supabase-webhook-payload.type';
import type { TwentyClientLike } from 'src/supabase-sync/types/twenty-client-like.type';
import { getSafeSourceRecordId, mapSupabaseRecord } from 'src/supabase-sync/utils/map-supabase-record';
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

const countForAction = (action: string, expectedAction: string): number =>
  action === expectedAction ? 1 : 0;

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
  const mappingResult = mapSupabaseRecord({
    eventType: payload.type ?? 'UNKNOWN',
    sourceSchema: payload.schema ?? 'public',
    sourceTable: payload.table,
    record,
  });

  if (!mappingResult.ok) {
    if (mappingResult.code === 'UNSUPPORTED_SOURCE_TABLE') {
      return {
        statusCode: 202,
        body: {
          ok: true,
          status: 'skipped',
          skipped: 1,
          error: mappingResult,
        },
      };
    }

    return {
      statusCode: 400,
      body: {
        ok: false,
        status: 'failed',
        failed: 1,
        error: mappingResult,
      },
    };
  }

  const upsertResult = await upsertTwentyRecord(input.client, mappingResult.record);

  if (upsertResult.action === 'failed') {
    console.warn('xopure_supabase_sync_row_failed', {
      sourceTable: payload.table,
      sourceRecordId,
      targetObject: upsertResult.targetObject,
      errorCode: upsertResult.errorCode,
      retryable: upsertResult.retryable,
    });

    return {
      statusCode: upsertResult.retryable ? 409 : 400,
      body: {
        ok: false,
        status: 'failed',
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 1,
        sourceTable: payload.table,
        sourceRecordId,
        targetObject: upsertResult.targetObject,
        syncMapId: upsertResult.syncMapId,
        error: {
          code: upsertResult.errorCode,
          message: upsertResult.errorMessage,
          retryable: upsertResult.retryable,
        },
      },
    };
  }

  console.info('xopure_supabase_sync_row_processed', {
    sourceTable: mappingResult.record.sourceTable,
    sourceRecordId: mappingResult.record.sourceRecordId,
    targetObject: upsertResult.targetObject,
    action: upsertResult.action,
  });

  return {
    statusCode: 200,
    body: {
      ok: true,
      status: upsertResult.action,
      created: countForAction(upsertResult.action, 'created'),
      updated: countForAction(upsertResult.action, 'updated'),
      skipped: countForAction(upsertResult.action, 'skipped'),
      failed: 0,
      sourceTable: mappingResult.record.sourceTable,
      sourceRecordId: mappingResult.record.sourceRecordId,
      targetObject: upsertResult.targetObject,
      twentyRecordId: upsertResult.twentyRecordId,
      syncMapId: upsertResult.syncMapId,
    },
  };
};
