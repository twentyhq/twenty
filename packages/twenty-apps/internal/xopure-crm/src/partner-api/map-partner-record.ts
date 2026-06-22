import { computeContentHash } from '../supabase-sync/utils/compute-content-hash';
import type {
  MappingResult,
  MappedSourceRecord,
} from '../supabase-sync/types/mapped-source-record.type';

const SOURCE_SYSTEM = 'xopure-partner' as const;
const SOURCE_SCHEMA = 'partner';

const stringValue = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const nullableStringValue = (value: unknown): string | null =>
  stringValue(value) ?? null;

const isoDateValue = (value: unknown): string | undefined => stringValue(value);

const normalizeToken = (value: unknown): string | undefined =>
  stringValue(value)?.trim().replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase();

const mapFulfillmentStatus = (value: unknown): string => {
  const normalized = normalizeToken(value);
  switch (normalized) {
    case 'CANCELLED':
    case 'CANCELED':
      return 'CANCELLED';
    case 'READY':
      return 'READY';
    case 'SYNCED':
      return 'SYNCED';
    case 'SHIPPED':
      return 'SHIPPED';
    default:
      return 'NOT_READY';
  }
};

const buildSyncKey = (
  sourceTable: string,
  sourceRecordId: string,
): string =>
  `${SOURCE_SYSTEM}.${SOURCE_SCHEMA}.${sourceTable}.${sourceRecordId}`;

const nowIso = (): string => new Date().toISOString();

const filterDefined = (
  fields: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  return result;
};

const buildError = (
  sourceTable: string,
  sourceRecordId: string | null,
  message: string,
): MappingResult => ({
  ok: false,
  code: 'MISSING_SOURCE_ID',
  message,
  retryable: false,
  sourceTable,
  sourceRecordId,
});

export const mapPartnerOrder = (
  row: Record<string, unknown>,
): MappingResult => {
  const orderShort = stringValue(row.order_short);

  if (!orderShort) {
    return buildError('partner_orders', null, 'Missing order_short in Partner API order row');
  }

  const fieldValues = filterDefined({
    orderShort,
    fulfillmentStatus: mapFulfillmentStatus(row.fulfillment_status),
    lastSyncedAt: nowIso(),
  });

  const record: MappedSourceRecord = {
    sourceSystem: SOURCE_SYSTEM,
    sourceSchema: SOURCE_SCHEMA,
    sourceTable: 'partner_orders',
    sourceRecordId: orderShort,
    syncKey: buildSyncKey('partner_orders', orderShort),
    targetObject: 'xopureOrder',
    externalIdField: 'orderShort',
    externalIdValue: orderShort,
    fieldValues,
    relations: [],
    contentHash: computeContentHash(fieldValues),
  };

  return { ok: true, record };
};

export const mapPartnerShipment = (
  row: Record<string, unknown>,
): MappingResult => {
  const orderShort = stringValue(row.order_short);

  if (!orderShort) {
    return buildError('partner_shipments', null, 'Missing order_short in Partner API shipment row');
  }

  const fieldValues = filterDefined({
    trackingNumber: stringValue(row.tracking_number),
    trackingUrl: stringValue(row.tracking_url),
    shippedAt: isoDateValue(row.shipped_at),
    deliveredAt: isoDateValue(row.delivered_at),
    fulfillmentStatus: mapFulfillmentStatus(row.fulfillment_status),
    lastSyncedAt: nowIso(),
  });

  const record: MappedSourceRecord = {
    sourceSystem: SOURCE_SYSTEM,
    sourceSchema: SOURCE_SCHEMA,
    sourceTable: 'partner_shipments',
    sourceRecordId: orderShort,
    syncKey: buildSyncKey('partner_shipments', orderShort),
    targetObject: 'xopureOrder',
    externalIdField: 'orderShort',
    externalIdValue: orderShort,
    fieldValues,
    relations: [],
    contentHash: computeContentHash(fieldValues),
  };

  return { ok: true, record };
};

export const mapPartnerAmbassador = (
  row: Record<string, unknown>,
): MappingResult => {
  const ambassadorId = stringValue(row.ambassador_id);

  if (!ambassadorId) {
    return buildError('partner_ambassadors', null, 'Missing ambassador_id in Partner API ambassador row');
  }

  const fieldValues = filterDefined({
    customSlug: nullableStringValue(row.custom_slug),
    referralUrl: nullableStringValue(row.referral_url),
    accountType: nullableStringValue(row.account_type),
    careerRank: nullableStringValue(row.career_rank),
    paidAsRank: nullableStringValue(row.paid_as_rank),
    lastSyncedAt: nowIso(),
  });

  const record: MappedSourceRecord = {
    sourceSystem: SOURCE_SYSTEM,
    sourceSchema: SOURCE_SCHEMA,
    sourceTable: 'partner_ambassadors',
    sourceRecordId: ambassadorId,
    syncKey: buildSyncKey('partner_ambassadors', ambassadorId),
    targetObject: 'xopureAmbassador',
    externalIdField: 'supabaseAmbassadorId',
    externalIdValue: ambassadorId,
    fieldValues,
    relations: [],
    contentHash: computeContentHash(fieldValues),
  };

  return { ok: true, record };
};
