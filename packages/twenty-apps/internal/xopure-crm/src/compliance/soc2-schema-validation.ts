export const SOC2_SCHEMA_NAMES = [
  'audit_event',
  'rbac_decision',
  'ledger_entry',
  'claim_review',
] as const;

export type Soc2SchemaName = (typeof SOC2_SCHEMA_NAMES)[number];

export type Soc2ValidationResult = {
  success: boolean;
  errors?: string[];
};

type FieldRule = {
  type: 'string' | 'boolean' | 'integer';
  required?: boolean;
  enum?: readonly string[];
  isoDateTime?: boolean;
};

type SchemaRuleSet = {
  required: readonly string[];
  fields: Record<string, FieldRule>;
};

const DECISIONS = ['allow', 'deny', 'error'] as const;
const LEDGER_STATUSES = [
  'pending',
  'held',
  'payable',
  'approved',
  'settled',
  'paid',
  'void',
  'reversed',
  'reissued',
] as const;
const PAY_AREAS = [
  'CUSTOMER_SALES',
  'TEAM_L1',
  'TEAM_L2',
  'WHOLESALE',
  'BONUS',
  'ADJUSTMENT',
] as const;
const CLAIM_AUTHOR_TYPES = ['ambassador', 'admin', 'system'] as const;
const CLAIM_CATEGORIES = [
  'wellness',
  'income',
  'product',
  'testimonial',
  'education',
] as const;
const CLAIM_REVIEW_STATUSES = [
  'approved',
  'rejected',
  'needs_revision',
] as const;

export const SOC2_SCHEMA_RULES: Record<Soc2SchemaName, SchemaRuleSet> = {
  audit_event: {
    required: [
      'schema_version',
      'event_id',
      'event_type',
      'occurred_at_utc',
      'actor_id',
      'actor_role',
      'action',
      'resource_type',
      'resource_id',
      'decision',
      'reason_code',
      'policy_version',
      'trace_id',
      'request_id',
      'source_ip_or_tailnet_node',
    ],
    fields: {
      schema_version: { type: 'string' },
      event_id: { type: 'string' },
      event_type: { type: 'string' },
      occurred_at_utc: { type: 'string', isoDateTime: true },
      actor_id: { type: 'string' },
      actor_role: { type: 'string' },
      tailscale_identity: { type: 'string' },
      jwt_jti: { type: 'string' },
      jit_grant_id: { type: 'string' },
      action: { type: 'string' },
      resource_type: { type: 'string' },
      resource_id: { type: 'string' },
      decision: { type: 'string', enum: DECISIONS },
      reason_code: { type: 'string' },
      policy_version: { type: 'string' },
      trace_id: { type: 'string' },
      request_id: { type: 'string' },
      source_ip_or_tailnet_node: { type: 'string' },
      before_hash: { type: 'string' },
      after_hash: { type: 'string' },
    },
  },
  rbac_decision: {
    required: [
      'schema_version',
      'actor_id',
      'actor_role',
      'action',
      'resource',
      'decision',
      'reason_code',
      'policy_version',
      'expires_at',
    ],
    fields: {
      schema_version: { type: 'string' },
      actor_id: { type: 'string' },
      actor_role: { type: 'string' },
      tailscale_identity: { type: 'string' },
      jwt_jti: { type: 'string' },
      jit_grant_id: { type: 'string' },
      action: { type: 'string' },
      resource: { type: 'string' },
      decision: { type: 'string', enum: DECISIONS },
      reason_code: { type: 'string' },
      policy_version: { type: 'string' },
      expires_at: { type: 'string', isoDateTime: true },
      evaluated_at_utc: { type: 'string', isoDateTime: true },
    },
  },
  ledger_entry: {
    required: [
      'schema_version',
      'ledger_id',
      'status',
      'pay_area',
      'amount_cents',
      'basis_cents',
      'rate_bps',
      'recipient_id',
      'buyer_id',
      'classification',
      'order_id',
      'recorded_at',
    ],
    fields: {
      schema_version: { type: 'string' },
      ledger_id: { type: 'string' },
      status: { type: 'string', enum: LEDGER_STATUSES },
      pay_area: { type: 'string', enum: PAY_AREAS },
      amount_cents: { type: 'integer' },
      basis_cents: { type: 'integer' },
      rate_bps: { type: 'integer' },
      recipient_id: { type: 'string' },
      buyer_id: { type: 'string' },
      classification: { type: 'string' },
      order_id: { type: 'string' },
      reversal_of_ledger_id: { type: 'string' },
      reissue_of_ledger_id: { type: 'string' },
      recorded_at: { type: 'string', isoDateTime: true },
    },
  },
  claim_review: {
    required: [
      'schema_version',
      'claim_id',
      'claim_text',
      'claim_channel',
      'claim_author_type',
      'claim_category',
      'prohibited_terms_detected',
      'requires_disclosure',
      'disclosure_present',
      'substantiation_required',
      'review_status',
      'reviewer_id',
      'reviewed_at_utc',
    ],
    fields: {
      schema_version: { type: 'string' },
      claim_id: { type: 'string' },
      claim_text: { type: 'string' },
      claim_channel: { type: 'string' },
      claim_author_type: { type: 'string', enum: CLAIM_AUTHOR_TYPES },
      claim_category: { type: 'string', enum: CLAIM_CATEGORIES },
      prohibited_terms_detected: { type: 'boolean' },
      requires_disclosure: { type: 'boolean' },
      disclosure_present: { type: 'boolean' },
      substantiation_required: { type: 'boolean' },
      substantiation_asset_id: { type: 'string' },
      review_status: { type: 'string', enum: CLAIM_REVIEW_STATUSES },
      reviewer_id: { type: 'string' },
      reviewed_at_utc: { type: 'string', isoDateTime: true },
    },
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isIsoDateTime = (value: string): boolean => {
  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) && value.includes('T');
};

const hasOwn = (record: Record<string, unknown>, field: string): boolean =>
  Object.prototype.hasOwnProperty.call(record, field);

const validateField = (
  record: Record<string, unknown>,
  field: string,
  rule: FieldRule,
): string[] => {
  if (!hasOwn(record, field) || record[field] === undefined || record[field] === null) {
    return [];
  }

  const value = record[field];
  const errors: string[] = [];

  if (rule.type === 'string') {
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`${field} must be a non-empty string`);
      return errors;
    }

    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
    }

    if (rule.isoDateTime && !isIsoDateTime(value)) {
      errors.push(`${field} must be an ISO-8601 date-time string`);
    }

    return errors;
  }

  if (rule.type === 'boolean' && typeof value !== 'boolean') {
    errors.push(`${field} must be a boolean`);
  }

  if (rule.type === 'integer' && !Number.isInteger(value)) {
    errors.push(`${field} must be integer cents or basis points`);
  }

  return errors;
};

const validateRequiredFields = (
  record: Record<string, unknown>,
  requiredFields: readonly string[],
): string[] =>
  requiredFields.flatMap((field) => {
    const value = record[field];

    if (value === undefined || value === null || value === '') {
      return [`${field} is required`];
    }

    return [];
  });

const validateLedgerEntryInvariants = (
  record: Record<string, unknown>,
): string[] => {
  const errors: string[] = [];

  if (
    typeof record.recipient_id === 'string' &&
    typeof record.buyer_id === 'string' &&
    record.recipient_id === record.buyer_id
  ) {
    errors.push('recipient_id cannot equal buyer_id');
  }

  return errors;
};

const validateClaimReviewInvariants = (
  record: Record<string, unknown>,
): string[] => {
  const errors: string[] = [];

  if (record.requires_disclosure === true && record.disclosure_present !== true) {
    errors.push('disclosure_present is required when requires_disclosure is true');
  }

  if (
    record.substantiation_required === true &&
    typeof record.substantiation_asset_id !== 'string'
  ) {
    errors.push(
      'substantiation_asset_id is required when substantiation_required is true',
    );
  }

  return errors;
};

export const validateSoc2Record = (
  schemaName: Soc2SchemaName,
  value: unknown,
): Soc2ValidationResult => {
  const schemaRules = SOC2_SCHEMA_RULES[schemaName];

  if (!schemaRules) {
    return { success: false, errors: [`Unknown SOC2 schema: ${schemaName}`] };
  }

  if (!isRecord(value)) {
    return { success: false, errors: [`${schemaName} must be an object`] };
  }

  const errors = [
    ...validateRequiredFields(value, schemaRules.required),
    ...Object.entries(schemaRules.fields).flatMap(([field, rule]) =>
      validateField(value, field, rule),
    ),
  ];

  if (schemaName === 'ledger_entry') {
    errors.push(...validateLedgerEntryInvariants(value));
  }

  if (schemaName === 'claim_review') {
    errors.push(...validateClaimReviewInvariants(value));
  }

  return errors.length === 0 ? { success: true } : { success: false, errors };
};
