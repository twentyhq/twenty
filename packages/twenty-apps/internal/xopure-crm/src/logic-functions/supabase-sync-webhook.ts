import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

type SupabaseWebhookBody = {
  type?: string;
  table?: string;
  schema?: string;
  record?: Record<string, unknown> | null;
  old_record?: Record<string, unknown> | null;
};

const TARGET_OBJECT_BY_SOURCE_TABLE: Record<string, string> = {
  customers: 'xopureCustomer',
  customer: 'xopureCustomer',
  ambassadors: 'xopureAmbassador',
  ambassador: 'xopureAmbassador',
  orders: 'xopureOrder',
  order: 'xopureOrder',
  commissions: 'xopureCommission',
  commission: 'xopureCommission',
  retail_prospects: 'retailProspect',
  retailProspects: 'retailProspect',
  influencer_prospects: 'influencerProspect',
  influencerProspects: 'influencerProspect',
};

const getRecordId = (
  record: Record<string, unknown> | null | undefined,
): string | null => {
  if (!record) {
    return null;
  }

  for (const key of ['id', 'uuid', 'customer_id', 'ambassador_id', 'order_id']) {
    const value = record[key];

    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return null;
};

const handler = async (event: RoutePayload) => {
  const expectedSecret = process.env.XOPURE_SYNC_WEBHOOK_SECRET;
  const providedSecret = event.headers['x-xopure-sync-secret'];

  if (expectedSecret && providedSecret !== expectedSecret) {
    return { statusCode: 401, body: { ok: false, error: 'Unauthorized' } };
  }

  const body = (event.body ?? {}) as SupabaseWebhookBody;
  const sourceTable = body.table;
  const sourceRecordId = getRecordId(body.record) ?? getRecordId(body.old_record);

  if (!sourceTable || !sourceRecordId) {
    return {
      statusCode: 400,
      body: {
        ok: false,
        error: 'Supabase webhook payload must include table and record.id.',
      },
    };
  }

  const targetObject = TARGET_OBJECT_BY_SOURCE_TABLE[sourceTable] ?? null;

  return {
    ok: true,
    accepted: true,
    normalized: {
      eventType: body.type ?? 'UNKNOWN',
      sourceSchema: body.schema ?? 'public',
      sourceTable,
      sourceRecordId,
      targetObject,
      hasTargetMapping: targetObject !== null,
    },
    nextStep:
      targetObject === null
        ? 'Add this source table to TARGET_OBJECT_BY_SOURCE_TABLE before enabling writes.'
        : 'Wire normalized payload into Twenty upsert and crm_sync_map persistence after source columns are confirmed.',
  };
};

export default defineLogicFunction({
  universalIdentifier: 'e9a5513e-0e57-4f38-9f10-517bc6440158',
  name: 'xopure-supabase-sync-webhook',
  description: 'Authenticated webhook intake stub for Supabase-to-Twenty CRM sync.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/xopure/sync/supabase',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-xopure-sync-secret', 'content-type'],
  },
});
