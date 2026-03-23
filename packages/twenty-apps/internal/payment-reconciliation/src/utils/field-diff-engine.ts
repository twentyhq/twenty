import { jaroWinkler } from 'jaro-winkler-typescript';

import type { StatusDecision } from 'src/utils/status-engine';

export type FieldDiffAction = 'UPDATE' | 'COMPUTED' | 'INFO_ONLY';
export type FieldDiffSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type FieldDiffApproval =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SKIPPED';
export type CrmObjectType = 'policy' | 'lead';

export type FieldDiff = {
  field: string;
  label: string;
  category: string;
  bobValue: string | null;
  crmValue: string | null;
  action: FieldDiffAction;
  severity: FieldDiffSeverity;
  approval: FieldDiffApproval;
  crmField: string | null;
  crmObjectType: CrmObjectType | null;
  note: string | null;
};

type BobRow = {
  memberFirstName: string | null;
  memberLastName: string | null;
  memberDob: string | null;
  brokerName: string | null;
  brokerNpn: string | null;
  trueEffectiveDate: string | null;
  carrierPolicyNumber: string | null;
  planName: string | null;
  memberPhone: string | null;
  memberEmail: string | null;
};

type CrmPolicyForDiff = {
  status: string | null;
  expirationDate: string | null;
  effectiveDate: string | null;
  policyNumber: string | null;
  planIdentifier: string | null;
  leadFirstName: string | null;
  leadLastName: string | null;
  leadDob: string | null;
  agentName: string | null;
  agentNpn: string | null;
  leadPhone: string | null;
  leadEmail: string | null;
};

type FieldMapping = {
  field: string;
  label: string;
  category: string;
  action: FieldDiffAction;
  severity: FieldDiffSeverity;
  crmField: string | null;
  crmObjectType: CrmObjectType | null;
  getBobValue: (row: BobRow) => string | null;
  getCrmValue: (policy: CrmPolicyForDiff) => string | null;
  compare: (bob: string | null, crm: string | null) => boolean;
};

const caseInsensitiveMatch = (
  a: string | null,
  b: string | null,
): boolean => {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;

  return a.trim().toLowerCase() === b.trim().toLowerCase();
};

const exactMatch = (a: string | null, b: string | null): boolean => {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;

  return a === b;
};

const NAME_THRESHOLD = 0.98;

const fuzzyNameMatch = (a: string | null, b: string | null): boolean => {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;

  return jaroWinkler(a.trim().toLowerCase(), b.trim().toLowerCase()) >= NAME_THRESHOLD;
};

const FIELD_MAPPINGS: FieldMapping[] = [
  // Identity
  {
    field: 'memberFirstName',
    label: 'First Name',
    category: 'Identity',
    action: 'UPDATE',
    severity: 'WARNING',
    crmField: 'lead.name.firstName',
    crmObjectType: 'lead',
    getBobValue: (r) => r.memberFirstName,
    getCrmValue: (p) => p.leadFirstName,
    compare: fuzzyNameMatch,
  },
  {
    field: 'memberLastName',
    label: 'Last Name',
    category: 'Identity',
    action: 'UPDATE',
    severity: 'WARNING',
    crmField: 'lead.name.lastName',
    crmObjectType: 'lead',
    getBobValue: (r) => r.memberLastName,
    getCrmValue: (p) => p.leadLastName,
    compare: fuzzyNameMatch,
  },
  {
    field: 'memberDob',
    label: 'Date of Birth',
    category: 'Identity',
    action: 'UPDATE',
    severity: 'WARNING',
    crmField: 'lead.dateOfBirth',
    crmObjectType: 'lead',
    getBobValue: (r) => r.memberDob,
    getCrmValue: (p) => p.leadDob,
    compare: exactMatch,
  },
  // Agent
  {
    field: 'brokerName',
    label: 'Agent Name',
    category: 'Agent',
    action: 'INFO_ONLY',
    severity: 'INFO',
    crmField: null,
    crmObjectType: null,
    getBobValue: (r) => r.brokerName,
    getCrmValue: (p) => p.agentName,
    compare: caseInsensitiveMatch,
  },
  {
    field: 'brokerNpn',
    label: 'Agent NPN',
    category: 'Agent',
    action: 'INFO_ONLY',
    severity: 'INFO',
    crmField: null,
    crmObjectType: null,
    getBobValue: (r) => r.brokerNpn,
    getCrmValue: (p) => p.agentNpn,
    compare: caseInsensitiveMatch,
  },
  // Dates
  {
    field: 'trueEffectiveDate',
    label: 'Effective Date',
    category: 'Dates',
    action: 'UPDATE',
    severity: 'WARNING',
    crmField: 'effectiveDate',
    crmObjectType: 'policy',
    getBobValue: (r) => r.trueEffectiveDate,
    getCrmValue: (p) => p.effectiveDate,
    compare: exactMatch,
  },
  // Policy
  {
    field: 'carrierPolicyNumber',
    label: 'Policy Number',
    category: 'Policy',
    action: 'UPDATE',
    severity: 'WARNING',
    crmField: 'policyNumber',
    crmObjectType: 'policy',
    getBobValue: (r) => r.carrierPolicyNumber,
    getCrmValue: (p) => p.policyNumber,
    compare: caseInsensitiveMatch,
  },
  {
    field: 'planName',
    label: 'Plan Name',
    category: 'Policy',
    action: 'INFO_ONLY',
    severity: 'INFO',
    crmField: null,
    crmObjectType: null,
    getBobValue: (r) => r.planName,
    getCrmValue: (p) => p.planIdentifier,
    compare: caseInsensitiveMatch,
  },
  {
    field: 'memberPhone',
    label: 'Phone',
    category: 'Policy',
    action: 'INFO_ONLY',
    severity: 'INFO',
    crmField: null,
    crmObjectType: null,
    getBobValue: (r) => r.memberPhone,
    getCrmValue: (p) => p.leadPhone,
    compare: caseInsensitiveMatch,
  },
  {
    field: 'memberEmail',
    label: 'Email',
    category: 'Policy',
    action: 'INFO_ONLY',
    severity: 'INFO',
    crmField: null,
    crmObjectType: null,
    getBobValue: (r) => r.memberEmail,
    getCrmValue: (p) => p.leadEmail,
    compare: caseInsensitiveMatch,
  },
];

export const computeFieldDiffs = (
  bobRow: BobRow,
  crmPolicy: CrmPolicyForDiff,
  statusDecision: StatusDecision | null,
): FieldDiff[] => {
  const diffs: FieldDiff[] = [];

  // Status diffs (COMPUTED from status engine)
  if (statusDecision) {
    if (statusDecision.derivedStatus !== crmPolicy.status) {
      diffs.push({
        field: 'status',
        label: 'Status',
        category: 'Status',
        bobValue: statusDecision.derivedStatus,
        crmValue: crmPolicy.status,
        action: 'COMPUTED',
        severity: 'CRITICAL',
        approval: 'PENDING',
        crmField: 'status',
        crmObjectType: 'policy',
        note: statusDecision.statusChangeReason,
      });
    }

    if (
      statusDecision.derivedExpireDate &&
      statusDecision.derivedExpireDate !== crmPolicy.expirationDate
    ) {
      diffs.push({
        field: 'expirationDate',
        label: 'Expiration Date',
        category: 'Status',
        bobValue: statusDecision.derivedExpireDate,
        crmValue: crmPolicy.expirationDate,
        action: 'COMPUTED',
        severity: 'CRITICAL',
        approval: 'PENDING',
        crmField: 'expirationDate',
        crmObjectType: 'policy',
        note: statusDecision.statusChangeReason,
      });
    }
  }

  // Field-level diffs from mappings
  for (const mapping of FIELD_MAPPINGS) {
    const bobValue = mapping.getBobValue(bobRow);
    const crmValue = mapping.getCrmValue(crmPolicy);

    // Skip if both are empty
    if (bobValue == null && crmValue == null) continue;

    // Only create diff when values differ
    if (!mapping.compare(bobValue, crmValue)) {
      diffs.push({
        field: mapping.field,
        label: mapping.label,
        category: mapping.category,
        bobValue,
        crmValue,
        action: mapping.action,
        severity: mapping.severity,
        approval: mapping.action === 'INFO_ONLY' ? 'SKIPPED' : 'PENDING',
        crmField: mapping.crmField,
        crmObjectType: mapping.crmObjectType,
        note: null,
      });
    }
  }

  return diffs;
};

export const summarizeDiffs = (diffs: FieldDiff[]): string => {
  if (diffs.length === 0) return '';

  const summaryParts: string[] = [];
  const MAX_INLINE = 3;

  for (let i = 0; i < Math.min(diffs.length, MAX_INLINE); i++) {
    const d = diffs[i];

    summaryParts.push(`${d.label}: ${d.crmValue ?? '—'} → ${d.bobValue ?? '—'}`);
  }

  if (diffs.length > MAX_INLINE) {
    summaryParts.push(`+${diffs.length - MAX_INLINE} more`);
  }

  return summaryParts.join('; ');
};
