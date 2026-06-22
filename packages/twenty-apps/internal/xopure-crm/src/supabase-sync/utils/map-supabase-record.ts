import { getSourceTableMapping } from '../constants/source-table-mapping';
import type {
  MappedSourceRecord,
  MappingResult,
  RelationReference,
  SourceIdentity,
  SupportedSourceTable,
} from '../types/mapped-source-record.type';
import { computeContentHash } from './compute-content-hash';

type MapSupabaseRecordInput = {
  eventType: string;
  sourceSchema: string;
  sourceTable: string;
  record: Record<string, unknown>;
};

const stringValue = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const nullableStringValue = (value: unknown): string | null =>
  stringValue(value) ?? null;

const numberValue = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const integerValue = (value: unknown): number | undefined => {
  const numericValue = numberValue(value);

  if (numericValue === undefined) {
    return undefined;
  }

  return Math.trunc(numericValue);
};

const booleanValue = (value: unknown): boolean | undefined =>
  typeof value === 'boolean' ? value : undefined;

const isoDateValue = (value: unknown): string | undefined => stringValue(value);

const getRecordId = (record: Record<string, unknown>): string | null =>
  stringValue(record.id) ??
  stringValue(record.uuid) ??
  stringValue(record.customer_id) ??
  stringValue(record.affiliate_id) ??
  stringValue(record.order_id) ??
  stringValue(record.order_item_id) ??
  stringValue(record.product_id) ??
  null;

export const toSyncKey = (identity: SourceIdentity): string =>
  `${identity.sourceSystem}.${identity.sourceSchema}.${identity.sourceTable}.${identity.sourceRecordId}`;

const normalizeToken = (value: unknown): string | undefined =>
  stringValue(value)?.trim().replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase();

const mapAmbassadorStatus = (value: unknown): string => {
  const normalized = normalizeToken(value);

  switch (normalized) {
    case 'PENDING':
    case 'APPLIED':
      return 'APPLIED';
    case 'APPROVED':
      return 'APPROVED';
    case 'ACTIVE':
    case 'ACTIVE_AFFILIATE':
      return 'ACTIVE';
    case 'PAUSED':
    case 'INACTIVE':
      return 'PAUSED';
    case 'SUSPENDED':
      return 'PAUSED';
    case 'REJECTED':
      return 'REJECTED';
    default:
      return 'APPLIED';
  }
};

const mapAmbassadorLevel = (value: unknown): string => {
  const normalized = normalizeToken(value);

  switch (normalized) {
    case 'ICON':
      return 'ELITE';
    case 'DIRECTOR':
      return 'GOLD';
    case 'BUILDER':
      return 'SILVER';
    case 'ACTIVE_AFFILIATE':
      return 'BRONZE';
    case 'BRONZE':
      return 'BRONZE';
    case 'SILVER':
      return 'SILVER';
    case 'GOLD':
      return 'GOLD';
    case 'PLATINUM':
      return 'PLATINUM';
    case 'ELITE':
    case 'ELITE_LEADER':
      return 'ELITE';
    default:
      return 'SEED';
  }
};

const mapProductStatus = (record: Record<string, unknown>): string => {
  if (booleanValue(record.pre_order) === true) {
    return 'PRE_ORDER';
  }

  if (booleanValue(record.featured) === true) {
    return 'FEATURED';
  }

  return booleanValue(record.active) === false ? 'INACTIVE' : 'ACTIVE';
};

const mapOrderStatus = (value: unknown): string => {
  const normalized = normalizeToken(value);

  switch (normalized) {
    case 'PAID':
    case 'SUCCEEDED':
    case 'COMPLETE':
      return 'PAID';
    case 'FULFILLED':
    case 'SHIPPED':
      return 'FULFILLED';
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return 'REFUNDED';
    case 'CANCELLED':
    case 'CANCELED':
      return 'CANCELLED';
    default:
      return 'OPEN';
  }
};

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

const mapCommissionStatus = (value: unknown): string => {
  const normalized = normalizeToken(value);

  switch (normalized) {
    case 'ACCRUED':
      return 'PENDING';
    case 'PAYABLE':
      return 'APPROVED';
    case 'HELD':
    case 'HOLD':
      return 'HELD';
    case 'APPROVED':
      return 'APPROVED';
    case 'PAID':
      return 'PAID';
    case 'VOID':
    case 'VOIDED':
    case 'CANCELLED':
    case 'CANCELED':
      return 'VOID';
    default:
      return 'PENDING';
  }
};

const mapPaymentStatus = (value: unknown): string => {
  const normalized = normalizeToken(value);

  switch (normalized) {
    case 'PROCESSING':
      return 'PROCESSING';
    case 'SUCCEEDED':
    case 'COMPLETE':
      return 'SUCCEEDED';
    case 'FAILED':
      return 'FAILED';
    case 'REFUNDED':
      return 'REFUNDED';
    case 'PARTIALLY_REFUNDED':
      return 'PARTIALLY_REFUNDED';
    case 'CANCELLED':
    case 'CANCELED':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
};

const mapSupportTicketStatus = (value: unknown): string => {
  const normalized = normalizeToken(value);

  switch (normalized) {
    case 'CLOSED':
      return 'CLOSED';
    case 'RESOLVED':
      return 'RESOLVED';
    case 'PENDING':
    case 'PENDING_CUSTOMER':
    case 'WAITING_ON_CUSTOMER':
      return 'PENDING_CUSTOMER';
    default:
      return 'NEW';
  }
};

const mapSupportTicketPriority = (value: unknown): string => {
  const normalized = normalizeToken(value);

  switch (normalized) {
    case 'LOW':
      return 'LOW';
    case 'HIGH':
      return 'HIGH';
    case 'URGENT':
    case 'CRITICAL':
      return 'URGENT';
    default:
      return 'NORMAL';
  }
};

const mapSupportTicketSelect = (
  value: unknown,
  allowedValues: Set<string>,
  fallback: string,
): string => {
  const normalized = normalizeToken(value);

  return normalized && allowedValues.has(normalized) ? normalized : fallback;
};

const withLastSyncedAt = (
  record: Record<string, unknown>,
  fieldValues: Record<string, unknown>,
): Record<string, unknown> => ({
  ...fieldValues,
  lastSyncedAt:
    isoDateValue(record.updated_at) ??
    isoDateValue(record.synced_at) ??
    isoDateValue(record.created_at) ??
    new Date().toISOString(),
});

const mapProduct = (record: Record<string, unknown>) =>
  withLastSyncedAt(record, {
    name: stringValue(record.name) ?? stringValue(record.sku) ?? 'Unnamed product',
    supabaseProductId: stringValue(record.id),
    sku: stringValue(record.sku),
    slug: stringValue(record.slug),
    priceCents: integerValue(record.price_cents) ?? 0,
    currencyCode: stringValue(record.currency) ?? 'USD',
    category: stringValue(record.category),
    status: mapProductStatus(record),
    stockQuantity: integerValue(record.stock_quantity) ?? 0,
    cvAmount: integerValue(record.cv_amount) ?? 0,
    productUrl: stringValue(record.product_url),
  });

const mapAmbassador = (record: Record<string, unknown>) =>
  withLastSyncedAt(record, {
    name: stringValue(record.name) ?? stringValue(record.email) ?? 'Unnamed ambassador',
    supabaseAmbassadorId: stringValue(record.id),
    supabaseUserId: stringValue(record.user_id),
    email: stringValue(record.email),
    level: mapAmbassadorLevel(
      record.paid_as_rank ?? record.career_rank ?? record.rank,
    ),
    status: mapAmbassadorStatus(record.status),
    referralCode: stringValue(record.tracking_code),
    sponsorAmbassadorExternalId: stringValue(record.parent_id),
    careerRank: stringValue(record.career_rank),
    paidAsRank: stringValue(record.paid_as_rank),
    commissionRate: numberValue(record.commission_rate) ?? 0,
    personalVolumeCents: integerValue(record.personal_volume_cents) ?? 0,
    teamVolumeCents: integerValue(record.team_volume_cents) ?? 0,
    activeCustomerCount: integerValue(record.active_customer_count) ?? 0,
    attributedRevenueCents: integerValue(record.team_volume_cents) ?? 0,
    researchSummary: stringValue(record.reason),
    phone: stringValue(record.phone),
    showPeptidesLink: booleanValue(record.show_peptides_link) ?? false,
    ...(integerValue(record.held_commission_cents) !== undefined && { heldCommissionCents: integerValue(record.held_commission_cents) }),
    ...(integerValue(record.payable_commission_cents) !== undefined && { payableCommissionCents: integerValue(record.payable_commission_cents) }),
    ...(integerValue(record.paid_commission_cents) !== undefined && { paidCommissionCents: integerValue(record.paid_commission_cents) }),
    ...(integerValue(record.lifetime_commission_cents) !== undefined
      ? { lifetimeCommissionCents: integerValue(record.lifetime_commission_cents) }
      : integerValue(record.total_commission_earned_cents) !== undefined
        ? { lifetimeCommissionCents: integerValue(record.total_commission_earned_cents) }
        : {}),
    lastCommissionAt: isoDateValue(record.last_commission_at),
  });

const buildReferralRelationshipKey = (
  sponsorAmbassadorId: string,
  sponsoredAmbassadorId: string,
): string => `${sponsorAmbassadorId}:${sponsoredAmbassadorId}`;

const mapReferralRelationshipFromAffiliate = (
  record: Record<string, unknown>,
): Record<string, unknown> | null => {
  const sponsorAmbassadorId = stringValue(record.parent_id);
  const sponsoredAmbassadorId = stringValue(record.id);

  if (!sponsorAmbassadorId || !sponsoredAmbassadorId) {
    return null;
  }

  const relationshipKey = buildReferralRelationshipKey(
    sponsorAmbassadorId,
    sponsoredAmbassadorId,
  );
  const sponsoredName =
    stringValue(record.name) ?? stringValue(record.email) ?? sponsoredAmbassadorId;

  return withLastSyncedAt(record, {
    relationshipKey,
    name: `${sponsorAmbassadorId} → ${sponsoredName}`,
    sponsorAmbassadorExternalId: sponsorAmbassadorId,
    sponsoredAmbassadorExternalId: sponsoredAmbassadorId,
    sponsorName: sponsorAmbassadorId,
    sponsoredName,
    depth: 1,
    isActive: true,
    activatedAt: isoDateValue(record.created_at),
  });
};

const mapReferralRelationshipRelations = (
  record: Record<string, unknown>,
): RelationReference[] => {
  const sponsorAmbassadorId = stringValue(record.parent_id);
  const sponsoredAmbassadorId = stringValue(record.id);

  if (!sponsorAmbassadorId || !sponsoredAmbassadorId) {
    return [];
  }

  return [
    {
      fieldName: 'sponsor',
      relationIdFieldName: 'sponsorId',
      targetObject: 'xopureAmbassador',
      externalIdField: 'supabaseAmbassadorId',
      externalIdValue: sponsorAmbassadorId,
      required: true,
    },
    {
      fieldName: 'sponsored',
      relationIdFieldName: 'sponsoredId',
      targetObject: 'xopureAmbassador',
      externalIdField: 'supabaseAmbassadorId',
      externalIdValue: sponsoredAmbassadorId,
      required: true,
    },
  ];
};

const mapCustomerExpertise = (record: Record<string, unknown>) =>
  withLastSyncedAt(record, {
    name:
      stringValue(record.name) ??
      stringValue(record.email) ??
      stringValue(record.customer_id) ??
      'XO Pure customer',
    supabaseCustomerId: stringValue(record.customer_id) ?? stringValue(record.id),
    email: stringValue(record.email),
    status: 'ACTIVE',
    coreTags: ['CUSTOMER'],
    lifetimeValueCents: integerValue(record.lifetime_value_cents) ?? 0,
    orderCount: integerValue(record.order_count) ?? 0,
    lastOrderAt: isoDateValue(record.last_order_at),
  });

const mapProfile = (record: Record<string, unknown>) =>
  withLastSyncedAt(record, {
    xopureSupabasePersonId: stringValue(record.id),
    name: {
      firstName: stringValue(record.first_name) ?? '',
      lastName: stringValue(record.last_name) ?? '',
    },
    emails: stringValue(record.email)
      ? { primaryEmail: stringValue(record.email), additionalEmails: [] }
      : undefined,
    phones: stringValue(record.phone)
      ? { primaryPhoneNumber: stringValue(record.phone), additionalPhones: [] }
      : undefined,
  });

const mapOrderRelations = (
  record: Record<string, unknown>,
): RelationReference[] => {
  const relations: RelationReference[] = [];
  const customerId = stringValue(record.customer_id);
  const ambassadorId = getFirstAffiliateId(record);

  if (customerId) {
    relations.push({
      fieldName: 'customer',
      relationIdFieldName: 'customerId',
      targetObject: 'xopureCustomer',
      externalIdField: 'supabaseCustomerId',
      externalIdValue: customerId,
      required: false,
    });
  }

  if (ambassadorId) {
    relations.push({
      fieldName: 'ambassador',
      relationIdFieldName: 'ambassadorId',
      targetObject: 'xopureAmbassador',
      externalIdField: 'supabaseAmbassadorId',
      externalIdValue: ambassadorId,
      required: false,
    });
  }

  return relations;
};

const getFirstAffiliateId = (record: Record<string, unknown>): string | undefined => {
  const affiliateChain = record.affiliate_chain;

  if (!Array.isArray(affiliateChain) || affiliateChain.length === 0) {
    return undefined;
  }

  const firstValue = affiliateChain[0];

  if (typeof firstValue !== 'string') {
    return undefined;
  }
  return firstValue;
};

const mapOrder = (record: Record<string, unknown>) =>
  withLastSyncedAt(record, {
    orderNumber: stringValue(record.id),
    supabaseOrderId: stringValue(record.id),
    commerceOrderId: stringValue(record.commerce_order_id),
    status: mapOrderStatus(
      stringValue(record.fulfillment_status) === 'cancelled'
        ? 'cancelled'
        : record.payment_status,
    ),
    subtotalCents: integerValue(record.subtotal_cents) ?? 0,
    shippingCents: integerValue(record.shipping_cents) ?? 0,
    taxCents: integerValue(record.tax_cents) ?? 0,
    discountCents: integerValue(record.discount_amount_cents) ?? 0,
    ...(integerValue(record.refund_amount_cents) !== undefined && { refundCents: integerValue(record.refund_amount_cents) }),
    totalCents:
      integerValue(record.total_cents) ?? integerValue(record.subtotal_cents) ?? 0,
    currencyCode: stringValue(record.currency) ?? 'USD',
    paymentStatus: normalizeToken(record.payment_status) ?? 'UNKNOWN',
    orderedAt: isoDateValue(record.created_at),
    customerExternalId:
      stringValue(record.customer_id) ?? stringValue(record.user_email),
    customerEmail: stringValue(record.user_email),
    ambassadorCode: getFirstAffiliateId(record),
    ambassadorExternalId: getFirstAffiliateId(record),
    commissionable: (integerValue(record.cv_amount) ?? 0) > 0,
    cvAmount: integerValue(record.cv_amount) ?? 0,
    buyerType: stringValue(record.buyer_type),
    fulfillmentStatus: mapFulfillmentStatus(record.fulfillment_status),
    paymentMethodCode: stringValue(record.payment_method_code),
    manualReviewRequired: booleanValue(record.manual_review_required) ?? false,
    trackingNumber: stringValue(record.tracking_number),
    trackingUrl: stringValue(record.tracking_url),
    shippedAt: isoDateValue(record.shipped_at),
    deliveredAt: isoDateValue(record.delivered_at),
  });

const mapOrderItemRelations = (
  record: Record<string, unknown>,
): RelationReference[] => {
  const relations: RelationReference[] = [];
  const orderId = stringValue(record.order_id);
  const productId = stringValue(record.product_id);

  if (orderId) {
    relations.push({
      fieldName: 'order',
      relationIdFieldName: 'orderId',
      targetObject: 'xopureOrder',
      externalIdField: 'supabaseOrderId',
      externalIdValue: orderId,
      required: true,
    });
  }

  if (productId) {
    relations.push({
      fieldName: 'product',
      relationIdFieldName: 'productId',
      targetObject: 'xopureProduct',
      externalIdField: 'supabaseProductId',
      externalIdValue: productId,
      required: true,
    });
  }

  return relations;
};

const mapOrderItem = (record: Record<string, unknown>) =>
  withLastSyncedAt(record, {
    name: stringValue(record.name) ?? stringValue(record.sku) ?? 'Order line',
    supabaseOrderItemId: stringValue(record.id),
    supabaseOrderId: stringValue(record.order_id),
    supabaseProductId: stringValue(record.product_id),
    sku: stringValue(record.sku),
    quantity: integerValue(record.quantity) ?? 1,
    unitPriceCents: integerValue(record.unit_price_cents) ?? 0,
    lineTotalCents: integerValue(record.line_total_cents) ?? 0,
    ...(integerValue(record.cv_amount) !== undefined && { cvAmount: integerValue(record.cv_amount) }),
    category: stringValue(record.category),
  });

const mapCommissionRelations = (
  record: Record<string, unknown>,
): RelationReference[] => {
  const relations: RelationReference[] = [];
  const ambassadorId = stringValue(record.affiliate_id);
  const orderId = stringValue(record.order_id);

  if (ambassadorId) {
    relations.push({
      fieldName: 'ambassador',
      relationIdFieldName: 'ambassadorId',
      targetObject: 'xopureAmbassador',
      externalIdField: 'supabaseAmbassadorId',
      externalIdValue: ambassadorId,
      required: true,
    });
  }

  if (orderId) {
    relations.push({
      fieldName: 'order',
      relationIdFieldName: 'orderId',
      targetObject: 'xopureOrder',
      externalIdField: 'supabaseOrderId',
      externalIdValue: orderId,
      required: false,
    });
  }

  return relations;
};

const mapCommission = (record: Record<string, unknown>) => {
  const rateUsed = numberValue(record.rate_used);
  const percentageBps = numberValue(record.percentage_bps);

  return withLastSyncedAt(record, {
    name: `${mapCommissionStatus(record.status)} ${stringValue(record.id) ?? ''}`.trim(),
    supabaseCommissionId: stringValue(record.id),
    ambassadorExternalId: stringValue(record.affiliate_id),
    orderExternalId: stringValue(record.order_id),
    amountCents: integerValue(record.amount_cents) ?? 0,
    rate:
      rateUsed !== undefined
        ? Number((rateUsed * 100).toFixed(5))
        : percentageBps !== undefined
          ? percentageBps / 100
          : 0,
    status: mapCommissionStatus(record.status),
    payArea: stringValue(record.pay_area),
    periodId: stringValue(record.period_id),
    holdUntil: isoDateValue(record.hold_until),
    paidAt: isoDateValue(record.paid_at),
    baseCvAmount: integerValue(record.base_cv_amount) ?? 0,
    sourceOrderId: stringValue(record.order_id),
    payableAt: isoDateValue(record.release_at),
  });
};

const mapPaymentRelations = (
  record: Record<string, unknown>,
): RelationReference[] => {
  const relations: RelationReference[] = [];
  const orderId = stringValue(record.order_id);

  if (orderId) {
    relations.push({
      fieldName: 'order',
      relationIdFieldName: 'orderId',
      targetObject: 'xopureOrder',
      externalIdField: 'supabaseOrderId',
      externalIdValue: orderId,
      required: true,
    });
  }

  return relations;
};

const mapPayment = (record: Record<string, unknown>) =>
  withLastSyncedAt(record, {
    name: `${stringValue(record.provider) ?? 'Payment'} ${stringValue(record.id) ?? ''}`.trim(),
    supabasePaymentId: stringValue(record.id),
    orderExternalId: stringValue(record.order_id),
    provider: stringValue(record.provider),
    rail: stringValue(record.rail),
    methodCode: stringValue(record.method_code),
    amountCents: integerValue(record.amount_cents) ?? 0,
    currencyCode: stringValue(record.currency) ?? 'USD',
    status: mapPaymentStatus(record.status),
    providerPaymentId: stringValue(record.provider_payment_id),
    ...(integerValue(record.refund_amount_cents) !== undefined && { refundCents: integerValue(record.refund_amount_cents) }),
    description: stringValue(record.description),
  });

const SUPPORT_TICKET_TYPES = new Set([
  'REFUND',
  'SHIPPING',
  'PRODUCT',
  'BILLING',
  'GENERAL',
]);

const SUPPORT_TICKET_SEVERITIES = new Set([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]);

const SUPPORT_TICKET_CHANNELS = new Set([
  'EMAIL',
  'CHAT',
  'PHONE',
  'DISPUTE',
  'INQUIRY',
]);

const mapSupportTicket = (record: Record<string, unknown>) =>
  withLastSyncedAt(record, {
    ticketNumber: stringValue(record.ticket_number) ?? stringValue(record.id),
    supabaseTicketId: stringValue(record.id),
    status: mapSupportTicketStatus(record.status),
    priority: mapSupportTicketPriority(record.priority),
    category: stringValue(record.category) ?? 'general',
    ticketType: mapSupportTicketSelect(
      record.ticket_type ?? record.category,
      SUPPORT_TICKET_TYPES,
      'GENERAL',
    ),
    severity: mapSupportTicketSelect(
      record.severity,
      SUPPORT_TICKET_SEVERITIES,
      'MEDIUM',
    ),
    productTag:
      stringValue(record.product_tag) ?? stringValue(record.related_product_id),
    channel: mapSupportTicketSelect(
      record.channel,
      SUPPORT_TICKET_CHANNELS,
      'INQUIRY',
    ),
    relatedOrderId: stringValue(record.related_order_id),
    subject: stringValue(record.subject) ?? 'Support ticket',
    body: stringValue(record.body) ?? '',
    requesterEmail: stringValue(record.requester_email) ?? '',
    requesterName: stringValue(record.requester_name) ?? '',
    requesterPhone: stringValue(record.requester_phone),
    messageCount: integerValue(record.message_count) ?? 0,
    firstResponseAt: isoDateValue(record.first_response_at),
    resolvedAt: isoDateValue(record.resolved_at),
    slaDeadline: isoDateValue(record.sla_deadline),
    slaBreached: booleanValue(record.sla_breached) ?? false,
    closedAt: isoDateValue(record.closed_at),
    lastActivityAt:
      isoDateValue(record.last_activity_at) ??
      isoDateValue(record.updated_at) ??
      isoDateValue(record.created_at) ??
      new Date().toISOString(),
  });

const mapFieldValues = (
  sourceTable: SupportedSourceTable,
  record: Record<string, unknown>,
): Record<string, unknown> => {
  switch (sourceTable) {
    case 'profiles':
      return mapProfile(record);
    case 'customer_expertise':
      return mapCustomerExpertise(record);
    case 'affiliates':
      return mapAmbassador(record);
    case 'products':
      return mapProduct(record);
    case 'orders':
      return mapOrder(record);
    case 'order_items':
      return mapOrderItem(record);
    case 'commission_ledger':
      return mapCommission(record);
    case 'payments':
      return mapPayment(record);
    case 'support_tickets':
      return mapSupportTicket(record);
  }
};

const mapRelations = (
  sourceTable: SupportedSourceTable,
  record: Record<string, unknown>,
): RelationReference[] => {
  switch (sourceTable) {
    case 'orders':
      return mapOrderRelations(record);
    case 'order_items':
      return mapOrderItemRelations(record);
    case 'commission_ledger':
      return mapCommissionRelations(record);
    case 'payments':
      return mapPaymentRelations(record);
    case 'profiles':
    case 'customer_expertise':
    case 'affiliates':
    case 'products':
    case 'support_tickets':
      return [];
  }
};

const buildMappedRecord = (
  input: MapSupabaseRecordInput,
  sourceTable: SupportedSourceTable,
  sourceRecordId: string,
): MappedSourceRecord => {
  const mapping = getSourceTableMapping(sourceTable);

  if (!mapping) {
    throw new Error(`Missing mapping for supported source table ${sourceTable}`);
  }

  const fieldValues = mapFieldValues(sourceTable, input.record);
  const externalIdValue = stringValue(fieldValues[mapping.externalIdField]);

  if (!externalIdValue) {
    throw new Error(
      `Mapped field ${mapping.externalIdField} is missing for ${sourceTable}`,
    );
  }

  return {
    sourceSystem: 'supabase' as const,
    sourceSchema: input.sourceSchema,
    sourceTable,
    sourceRecordId,
    syncKey: toSyncKey({
      sourceSystem: 'supabase' as const,
      sourceSchema: input.sourceSchema,
      sourceTable,
      sourceRecordId,
    }),
    targetObject: mapping.targetObject,
    externalIdField: mapping.externalIdField,
    externalIdValue,
    fieldValues,
    relations: mapRelations(sourceTable, input.record),
    contentHash: computeContentHash({
      targetObject: mapping.targetObject,
      externalIdField: mapping.externalIdField,
      externalIdValue,
      fieldValues,
    }),
  };
};

const buildReferralRelationshipMappedRecord = (
  input: MapSupabaseRecordInput,
): MappedSourceRecord | null => {
  const fieldValues = mapReferralRelationshipFromAffiliate(input.record);

  if (!fieldValues) {
    return null;
  }

  const relationshipKey = stringValue(fieldValues.relationshipKey);

  if (!relationshipKey) {
    throw new Error('Mapped field relationshipKey is missing for affiliates');
  }

  return {
    sourceSystem: 'supabase' as const,
    sourceSchema: input.sourceSchema,
    sourceTable: 'affiliates' as const,
    sourceRecordId: `referral:${relationshipKey}`,
    syncKey: toSyncKey({
      sourceSystem: 'supabase' as const,
      sourceSchema: input.sourceSchema,
      sourceTable: 'affiliates' as const,
      sourceRecordId: `referral:${relationshipKey}`,
    }),
    targetObject: 'xopureReferralRelationship',
    externalIdField: 'relationshipKey',
    externalIdValue: relationshipKey,
    fieldValues,
    relations: mapReferralRelationshipRelations(input.record),
    contentHash: computeContentHash({
      targetObject: 'xopureReferralRelationship',
      externalIdField: 'relationshipKey',
      externalIdValue: relationshipKey,
      fieldValues,
    }),
  };
};

export const mapSupabaseRecord = (
  input: MapSupabaseRecordInput,
): MappingResult => {
  const sourceRecordId = getRecordId(input.record);
  const mapping = getSourceTableMapping(input.sourceTable);

  if (!mapping) {
    return {
      ok: false,
      code: 'UNSUPPORTED_SOURCE_TABLE',
      message: `Source table ${input.sourceTable} is not supported by Phase 1 sync.`,
      retryable: false,
      sourceTable: input.sourceTable,
      sourceRecordId,
    };
  }

  if (!sourceRecordId) {
    return {
      ok: false,
      code: 'MISSING_SOURCE_ID',
      message: `Source table ${input.sourceTable} record is missing a stable source id.`,
      retryable: false,
      sourceTable: input.sourceTable,
      sourceRecordId: null,
    };
  }

  try {
    return {
      ok: true,
      record: buildMappedRecord(
        input,
        mapping.sourceTable,
        sourceRecordId,
      ),
    };
  } catch (error) {
    return {
      ok: false,
      code: 'MALFORMED_RECORD',
      message: error instanceof Error ? error.message : 'Malformed source record.',
      retryable: false,
      sourceTable: input.sourceTable,
      sourceRecordId,
    };
  }
};

export const mapSupabaseRecords = (
  input: MapSupabaseRecordInput,
): MappingResult[] => {
  const primaryMappingResult = mapSupabaseRecord(input);

  if (!primaryMappingResult.ok || primaryMappingResult.record.sourceTable !== 'affiliates') {
    return [primaryMappingResult];
  }

  const referralRelationshipRecord = buildReferralRelationshipMappedRecord(input);

  return referralRelationshipRecord
    ? [primaryMappingResult, { ok: true, record: referralRelationshipRecord }]
    : [primaryMappingResult];
};

export const getSafeSourceRecordId = (
  record: Record<string, unknown> | null | undefined,
): string | null => (record ? getRecordId(record) : null);

export const getNullableStringValue = nullableStringValue;
