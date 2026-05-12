import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

type SupabaseWebhookBody = {
  type?: string;
  table?: string;
  schema?: string;
  record?: Record<string, unknown> | null;
  old_record?: Record<string, unknown> | null;
};

const TARGET_OBJECT_BY_SOURCE_TABLE: Record<string, string> = {
  affiliates: 'xopureAmbassador',
  affiliate_payouts: 'xopureCommission',
  customers: 'xopureCustomer',
  customer: 'xopureCustomer',
  customer_expertise: 'xopureCustomer',
  ambassadors: 'xopureAmbassador',
  ambassador: 'xopureAmbassador',
  products: 'xopureProduct',
  product: 'xopureProduct',
  orders: 'xopureOrder',
  order: 'xopureOrder',
  order_items: 'xopureOrderLine',
  order_item: 'xopureOrderLine',
  commissions: 'xopureCommission',
  commission: 'xopureCommission',
  commission_ledger: 'xopureCommission',
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

  for (const key of [
    'id',
    'uuid',
    'customer_id',
    'affiliate_id',
    'ambassador_id',
    'order_id',
    'order_item_id',
    'product_id',
    'email',
  ]) {
    const value = record[key];

    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return null;
};

const centsToDollars = (value: unknown): number => {
  if (typeof value !== 'number') {
    return 0;
  }

  return Math.round(value) / 100;
};

const boolToStatus = (value: unknown): 'ACTIVE' | 'INACTIVE' =>
  value === false ? 'INACTIVE' : 'ACTIVE';

const normalizeStatus = (status: unknown): string | undefined => {
  if (typeof status !== 'string') {
    return undefined;
  }

  return status.trim().toUpperCase();
};

const normalizeRecordForTwenty = (
  sourceTable: string,
  record: Record<string, unknown>,
): Record<string, unknown> => {
  switch (sourceTable) {
    case 'affiliates':
    case 'ambassadors':
    case 'ambassador':
      return {
        name: record.name,
        supabaseAmbassadorId: record.id,
        level: normalizeStatus(record.paid_as_rank ?? record.career_rank ?? record.rank),
        status: normalizeStatus(record.status),
        referralCode: record.tracking_code,
        attributedRevenue: centsToDollars(record.team_volume_cents),
        totalCommissionEarned: 0,
        researchSummary: record.reason,
      };

    case 'products':
    case 'product':
      return {
        name: record.name,
        supabaseProductId: record.id,
        sku: record.sku,
        slug: record.slug,
        priceCents: record.price_cents,
        currency: record.currency,
        category: record.category,
        status: record.pre_order === true ? 'PRE_ORDER' : boolToStatus(record.active),
        stockQuantity: record.stock_quantity,
        cvAmount: record.cv_amount,
        productUrl: record.product_url,
        lastSyncedAt: record.synced_at ?? record.updated_at,
      };

    case 'orders':
    case 'order':
      return {
        orderNumber: record.id,
        supabaseOrderId: record.id,
        status: normalizeStatus(record.payment_status),
        orderTotal: centsToDollars(record.total_cents ?? record.subtotal_cents),
        orderedAt: record.created_at,
        customerExternalId: record.customer_id ?? record.user_email,
        ambassadorCode: Array.isArray(record.affiliate_chain)
          ? record.affiliate_chain[0]
          : undefined,
        commissionable: typeof record.cv_amount === 'number' && record.cv_amount > 0,
      };

    case 'order_items':
    case 'order_item':
      return {
        name: record.name,
        supabaseOrderItemId: record.id,
        supabaseOrderId: record.order_id,
        supabaseProductId: record.product_id,
        sku: record.sku,
        quantity: record.quantity,
        unitPriceCents: record.unit_price_cents,
        lineTotalCents: record.line_total_cents,
        cvAmount: record.cv_amount,
        category: record.category,
      };

    case 'commission_ledger':
    case 'commissions':
    case 'commission':
    case 'affiliate_payouts':
      return {
        name: `${record.status ?? 'Commission'} ${record.id ?? ''}`.trim(),
        supabaseCommissionId: record.id,
        ambassadorExternalId: record.affiliate_id,
        orderExternalId: record.order_id,
        amount: centsToDollars(record.amount_cents),
        rate:
          typeof record.rate_used === 'number'
            ? record.rate_used * 100
            : typeof record.percentage_bps === 'number'
              ? record.percentage_bps / 100
              : 0,
        status: normalizeStatus(record.status),
        paidAt: record.paid_at,
      };

    case 'customer_expertise':
    case 'customers':
    case 'customer':
      return {
        name: record.name ?? record.customer_id ?? record.email,
        supabaseCustomerId: record.customer_id ?? record.id,
        status: 'ACTIVE',
        coreTags: ['CUSTOMER'],
        lastSyncedAt: record.updated_at ?? record.last_interaction_at,
      };

    case 'retail_prospects':
    case 'retailProspects':
    case 'influencer_prospects':
    case 'influencerProspects':
      return record;

    default:
      return record;
  }
};

// Extracts raw ambassador attribution from the Supabase record so the
// write-through can resolve affiliate_id to a workspace member via the
// ambassador profile's workspaceMemberId field.
const extractAttribution = (
  sourceTable: string,
  record: Record<string, unknown> | null | undefined,
): { affiliateId: string | null } | null => {
  if (!record) {
    return null;
  }

  switch (sourceTable) {
    case 'orders':
    case 'order': {
      const chain = record.affiliate_chain;
      const affiliateId = Array.isArray(chain) && chain.length > 0
        ? String(chain[0])
        : null;
      return { affiliateId };
    }
    case 'commission_ledger':
    case 'commissions':
    case 'commission':
    case 'affiliate_payouts':
      return { affiliateId: typeof record.affiliate_id === 'string' ? record.affiliate_id : null };
    case 'affiliates':
    case 'ambassadors':
    case 'ambassador':
      return { affiliateId: typeof record.id === 'string' ? record.id : null };
    default:
      return null;
  }
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
  const normalizedFieldValues =
    targetObject && body.record
      ? normalizeRecordForTwenty(sourceTable, body.record)
      : null;

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
      upsertKey: `${body.schema ?? 'public'}.${sourceTable}.${sourceRecordId}`,
      fieldValues: normalizedFieldValues,
      attribution: extractAttribution(sourceTable, body.record),
    },
    nextStep:
      targetObject === null
        ? 'Add this source table to TARGET_OBJECT_BY_SOURCE_TABLE before enabling writes.'
        : 'Send fieldValues to Twenty Core API upsert and persist the resulting record ID in public.crm_sync_map. Resolve attribution.affiliateId to workspaceMemberId via ambassador profile lookup.',
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
