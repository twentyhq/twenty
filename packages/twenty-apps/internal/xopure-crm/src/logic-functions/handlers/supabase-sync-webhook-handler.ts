import type { SupabaseWebhookPayload } from '../types/supabase-webhook-payload.type';
import type {
  SyncStatus,
  UpsertResult,
} from 'src/supabase-sync/types/mapped-source-record.type';
import type { TwentyClientLike } from 'src/supabase-sync/types/twenty-client-like.type';
import { computeContentHash } from 'src/supabase-sync/utils/compute-content-hash';
import {
  getSafeSourceRecordId,
  mapSupabaseRecords,
} from 'src/supabase-sync/utils/map-supabase-record';
import {
  findSyncMap,
  updateExistingSyncMap,
} from 'src/supabase-sync/utils/upsert-sync-map';
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

type MappingInput = Parameters<typeof mapSupabaseRecords>[0];
type MappingResult = ReturnType<typeof mapSupabaseRecords>[number];

type MappingPayload = {
  type?: SupabaseWebhookPayload['type'];
  schema?: string;
  table: string;
  record: Record<string, unknown>;
};

const ORDER_PAYMENT_FIELDS = [
  'payment_gateway',
  'payment_status',
  'total_cents',
  'subtotal_cents',
  'payment_method_code',
] as const;

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

const hasOrderPaymentFields = (record: Record<string, unknown>): boolean =>
  ORDER_PAYMENT_FIELDS.some((fieldName) =>
    Object.prototype.hasOwnProperty.call(record, fieldName),
  );

const buildPaymentRecordFromOrder = (
  record: Record<string, unknown>,
): Record<string, unknown> => ({
  ...record,
  order_id: record.order_id ?? record.id,
  provider: record.payment_gateway ?? record.payment_method_code,
  method_code: record.payment_method_code ?? record.payment_gateway,
  amount_cents: record.total_cents ?? record.subtotal_cents,
  status: record.payment_status,
  refund_amount_cents: record.refund_amount_cents ?? 0,
});

const expandWebhookMappingInputs = (
  payload: MappingPayload,
): MappingInput[] => {
  const baseInput = {
    eventType: payload.type ?? 'UNKNOWN',
    sourceSchema: payload.schema ?? 'public',
    sourceTable: payload.table,
    record: payload.record,
  };

  if (payload.table !== 'orders' || !hasOrderPaymentFields(payload.record)) {
    return [baseInput];
  }

  return [
    baseInput,
    {
      ...baseInput,
      sourceTable: 'payments',
      record: buildPaymentRecordFromOrder(payload.record),
    },
  ];
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

  if (payload?.type === 'DELETE') {
    const oldRecord = payload.old_record;

    if (!payload.table || !oldRecord || !isRecord(oldRecord)) {
      return {
        statusCode: 400,
        body: {
          ok: false,
          error: {
            code: 'MALFORMED_PAYLOAD',
            message: 'DELETE webhook must include table and old_record.',
            retryable: false,
          },
        },
      };
    }

    const sourceRecordId = getSafeSourceRecordId(oldRecord);
    const mappingResults: MappingResult[] = [];

    for (const mappingInput of expandWebhookMappingInputs({
      type: payload.type,
      schema: payload.schema,
      table: payload.table,
      record: oldRecord,
    })) {
      mappingResults.push(...mapSupabaseRecords(mappingInput));
    }

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
    let tombstoned = 0;

    for (const mappedRecord of mappedRecords) {
      const existingSyncMap = await findSyncMap(
        input.client,
        mappedRecord.syncKey,
      );

      if (!existingSyncMap) {
        continue;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          mappedRecord.fieldValues,
          'status',
        )
      ) {
        mappedRecord.fieldValues.status = 'DELETED';
      }

      mappedRecord.contentHash = computeContentHash({
        targetObject: mappedRecord.targetObject,
        externalIdField: mappedRecord.externalIdField,
        externalIdValue: mappedRecord.externalIdValue,
        fieldValues: mappedRecord.fieldValues,
      });

      if (existingSyncMap.targetRecordId) {
        await upsertTwentyRecord(input.client, mappedRecord);
      }

      await updateExistingSyncMap({
        client: input.client,
        syncMapId: existingSyncMap.id,
        record: mappedRecord,
        targetRecordId: existingSyncMap.targetRecordId,
        status: 'DELETED' as SyncStatus,
      });

      tombstoned += 1;

      console.info('xopure_supabase_sync_row_tombstoned', {
        sourceTable: mappedRecord.sourceTable,
        sourceRecordId: mappedRecord.sourceRecordId,
        targetObject: mappedRecord.targetObject,
      });
    }

    return {
      statusCode: 200,
      body: {
        ok: true,
        status: 'tombstoned',
        tombstoned,
        sourceTable: payload.table,
        sourceRecordId,
      },
    };
  }

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
  const mappingResults: MappingResult[] = [];

  for (const mappingInput of expandWebhookMappingInputs({
    type: payload.type,
    schema: payload.schema,
    table: payload.table,
    record,
  })) {
    mappingResults.push(...mapSupabaseRecords(mappingInput));
  }
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
