import { jaroWinkler } from 'jaro-winkler-typescript';

export type MatchMethod =
  | 'OVERRIDE'
  | 'POLICY_NUMBER_DATE_AGENT'
  | 'POLICY_NUMBER_PLUS_EFFECTIVE_DATE'
  | 'POLICY_NUMBER_PLUS_AGENT'
  | 'POLICY_NUMBER_SINGLE'
  | 'POLICY_NUMBER_MULTI_BEST'
  | 'NPN_DATE_NAME'
  | 'NAME_DOB_DATE'
  | 'MISSING_FROM_BOB'
  | 'POLICY_NUMBER_DISCOVERY'
  | 'UNMATCHED';

export type MatchStatus = 'AUTO_MATCHED' | 'NEEDS_REVIEW' | 'UNMATCHED';

export type MatchDecision = {
  crmPolicyId: string | null;
  crmPolicyNumber: string | null;
  confidence: number;
  method: MatchMethod;
  status: MatchStatus;
  notes: string;
};

export type BobRow = {
  carrierPolicyNumber: string | null;
  brokerName: string | null;
  brokerNpn: string | null;
  trueEffectiveDate: string | null;
  memberFirstName: string | null;
  memberLastName: string | null;
  memberDob: string | null;
};

export type CrmPolicy = {
  id: string;
  policyNumber: string | null;
  applicationId: string | null;
  effectiveDate: string | null;
  expirationDate: string | null;
  status: string | null;
  leadFirstName: string | null;
  leadLastName: string | null;
  leadDob: string | null;
  agentName: string | null;
  agentNpn: string | null;
  planIdentifier: string | null;
  leadPhone: string | null;
  leadEmail: string | null;
  leadId: string | null;
};

export type Override = {
  carrierPolicyNumber: string;
  carrierName: string;
  crmPolicyId: string;
  isActive: boolean;
};

export type MatchingConfig = {
  enabledTiers: string[];
  autoMatchThreshold: number;
  autoRejectThreshold: number;
  dateToleranceDays: number;
  nameMatchThreshold: number;
  /** When true, detect active CRM policies missing from the BOB (2-way reconciliation). Default: false (1-way). */
  enableMissingFromBob: boolean;
};

export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  enabledTiers: [
    'OVERRIDE',
    'POLICY_NUMBER_DATE_AGENT',
    'POLICY_NUMBER_DATE',
    'POLICY_NUMBER_AGENT',
    'POLICY_NUMBER_SINGLE',
    'POLICY_NUMBER_MULTI_BEST',
    'NPN_DATE_NAME',
    'NAME_DOB_DATE',
  ],
  autoMatchThreshold: 85,
  autoRejectThreshold: 30,
  dateToleranceDays: 30,
  nameMatchThreshold: 0.88,
  enableMissingFromBob: false,
};

// --- Fuzzy matching helpers ---

const COMPANY_SUFFIXES = /\b(llc|inc|corp|corporation|dba|ltd|co|company)\b/gi;

const normalizeAgentName = (name: string): string =>
  name.toLowerCase().replace(COMPANY_SUFFIXES, '').replace(/[.,]/g, '').trim();

export const agentNameMatches = (
  brokerName: string | null,
  agentName: string | null,
): boolean => {
  if (!brokerName || !agentName) {
    return false;
  }

  const broker = normalizeAgentName(brokerName);
  const agent = normalizeAgentName(agentName);

  if (jaroWinkler(broker, agent) >= 0.85) {
    return true;
  }

  return broker.includes(agent) || agent.includes(broker);
};

export const memberNameScore = (
  bobFirst: string | null,
  bobLast: string | null,
  crmFirst: string | null,
  crmLast: string | null,
): number => {
  if (!bobFirst || !bobLast || !crmFirst || !crmLast) {
    return 0;
  }

  const firstScore = jaroWinkler(
    bobFirst.toLowerCase(),
    crmFirst.toLowerCase(),
  );
  const lastScore = jaroWinkler(
    bobLast.toLowerCase(),
    crmLast.toLowerCase(),
  );

  return firstScore * 0.4 + lastScore * 0.6;
};

export const datesWithinDays = (
  dateA: string | null,
  dateB: string | null,
  days: number,
): boolean => {
  if (!dateA || !dateB) {
    return false;
  }

  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  const diffMs = Math.abs(a - b);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays <= days;
};

const dateProximityScore = (
  dateA: string | null,
  dateB: string | null,
): number => {
  if (!dateA || !dateB) {
    return 0;
  }

  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  const diffDays = Math.abs(a - b) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return 1;
  if (diffDays <= 7) return 0.9;
  if (diffDays <= 30) return 0.7;
  if (diffDays <= 60) return 0.4;

  return 0.1;
};

const classifyConfidence = (
  confidence: number,
  config: MatchingConfig,
): MatchStatus => {
  if (confidence >= config.autoMatchThreshold) return 'AUTO_MATCHED';
  if (confidence < config.autoRejectThreshold) return 'UNMATCHED';

  return 'NEEDS_REVIEW';
};

/**
 * Validates that a policy number looks like a real Ambetter policy number.
 * Ambetter policy numbers always start with "U" (e.g., U94692964).
 * Non-U values are likely FFM IDs or other mistyped identifiers.
 */
export const isValidAmbetterPolicyNumber = (
  policyNumber: string | null,
): boolean => {
  if (!policyNumber) return false;

  return policyNumber.trim().toUpperCase().startsWith('U');
};

/**
 * Combined full-name fuzzy match. Concatenates "firstName lastName" from both
 * sides and runs Jaro-Winkler on the combined strings.
 * Handles typos like "Marry Jane" → "Mary Jane" at 95%+ confidence.
 */
export const combinedNameFuzzyMatch = (
  firstName1: string | null,
  lastName1: string | null,
  firstName2: string | null,
  lastName2: string | null,
): number => {
  if (!firstName1 || !lastName1 || !firstName2 || !lastName2) return 0;

  const full1 = `${firstName1.trim()} ${lastName1.trim()}`.toLowerCase();
  const full2 = `${firstName2.trim()} ${lastName2.trim()}`.toLowerCase();

  return jaroWinkler(full1, full2);
};

const isTierEnabled = (tier: string, config: MatchingConfig): boolean =>
  config.enabledTiers.includes(tier);

export type MatchIndexes = {
  policyByNumber: Map<string, CrmPolicy[]>;
  policyByNpn: Map<string, CrmPolicy[]>;
  policyByDob: Map<string, CrmPolicy[]>;
  policyById: Map<string, CrmPolicy>;
};

export const buildMatchIndexes = (policies: CrmPolicy[]): MatchIndexes => {
  const policyByNumber = new Map<string, CrmPolicy[]>();
  const policyByNpn = new Map<string, CrmPolicy[]>();
  const policyByDob = new Map<string, CrmPolicy[]>();
  const policyById = new Map<string, CrmPolicy>();

  for (const p of policies) {
    policyById.set(p.id, p);

    if (p.policyNumber) {
      const existing = policyByNumber.get(p.policyNumber) ?? [];

      existing.push(p);
      policyByNumber.set(p.policyNumber, existing);
    }

    if (p.agentNpn) {
      const existing = policyByNpn.get(p.agentNpn) ?? [];

      existing.push(p);
      policyByNpn.set(p.agentNpn, existing);
    }

    if (p.leadDob) {
      const existing = policyByDob.get(p.leadDob) ?? [];

      existing.push(p);
      policyByDob.set(p.leadDob, existing);
    }
  }

  return { policyByNumber, policyByNpn, policyByDob, policyById };
};

export const matchRow = (
  row: BobRow,
  indexes: MatchIndexes,
  overrides: Override[],
  carrierName: string,
  config: MatchingConfig = DEFAULT_MATCHING_CONFIG,
): MatchDecision => {
  const tolerance = config.dateToleranceDays;

  // Tier 1: Override check
  if (isTierEnabled('OVERRIDE', config) && row.carrierPolicyNumber) {
    const override = overrides.find(
      (o) =>
        o.isActive &&
        o.carrierPolicyNumber === row.carrierPolicyNumber &&
        o.carrierName.toLowerCase() === carrierName.toLowerCase(),
    );

    if (override) {
      const policy = indexes.policyById.get(override.crmPolicyId);

      return {
        crmPolicyId: override.crmPolicyId,
        crmPolicyNumber: policy?.policyNumber ?? null,
        confidence: 100,
        method: 'OVERRIDE',
        status: 'AUTO_MATCHED',
        notes: `Manual override: carrier policy ${row.carrierPolicyNumber} → CRM policy ${override.crmPolicyId}`,
      };
    }
  }

  // Find all policies with matching policy number
  const policyNumberMatches = row.carrierPolicyNumber
    ? indexes.policyByNumber.get(row.carrierPolicyNumber) ?? []
    : [];

  if (policyNumberMatches.length > 0) {
    // Tier 2: Policy number + effective date + agent name (3-signal)
    if (
      isTierEnabled('POLICY_NUMBER_DATE_AGENT', config) &&
      row.trueEffectiveDate &&
      row.brokerName
    ) {
      const tripleMatches = policyNumberMatches.filter(
        (p) =>
          datesWithinDays(p.effectiveDate, row.trueEffectiveDate, tolerance) &&
          agentNameMatches(row.brokerName, p.agentName),
      );

      if (tripleMatches.length === 1) {
        const match = tripleMatches[0];

        return {
          crmPolicyId: match.id,
          crmPolicyNumber: match.policyNumber,
          confidence: 98,
          method: 'POLICY_NUMBER_DATE_AGENT',
          status: classifyConfidence(98, config),
          notes: `3-signal match: policy number + effective date (BOB: ${row.trueEffectiveDate}, CRM: ${match.effectiveDate}) + agent "${row.brokerName}"→"${match.agentName}"`,
        };
      }
    }

    // Tier 3: Policy number + effective date
    if (
      isTierEnabled('POLICY_NUMBER_DATE', config) &&
      row.trueEffectiveDate
    ) {
      const dateMatches = policyNumberMatches.filter((p) =>
        datesWithinDays(p.effectiveDate, row.trueEffectiveDate, tolerance),
      );

      if (dateMatches.length === 1) {
        const match = dateMatches[0];

        return {
          crmPolicyId: match.id,
          crmPolicyNumber: match.policyNumber,
          confidence: 95,
          method: 'POLICY_NUMBER_PLUS_EFFECTIVE_DATE',
          status: classifyConfidence(95, config),
          notes: `Policy number matched, effective dates within ${tolerance} days (BOB: ${row.trueEffectiveDate}, CRM: ${match.effectiveDate})`,
        };
      }
    }

    // Tier 4: Policy number + agent name (fuzzy)
    if (isTierEnabled('POLICY_NUMBER_AGENT', config) && row.brokerName) {
      const agentMatches = policyNumberMatches.filter((p) =>
        agentNameMatches(row.brokerName, p.agentName),
      );

      if (agentMatches.length === 1) {
        const match = agentMatches[0];

        return {
          crmPolicyId: match.id,
          crmPolicyNumber: match.policyNumber,
          confidence: 85,
          method: 'POLICY_NUMBER_PLUS_AGENT',
          status: classifyConfidence(85, config),
          notes: `Policy number matched, broker "${row.brokerName}" matched agent "${match.agentName}"`,
        };
      }
    }

    // Tier 5: Single policy number match
    // When exactly one CRM policy has this carrier policy number, it's a
    // definitive identifier match — the Ambetter U-number is unique per member.
    if (
      isTierEnabled('POLICY_NUMBER_SINGLE', config) &&
      policyNumberMatches.length === 1
    ) {
      const match = policyNumberMatches[0];

      return {
        crmPolicyId: match.id,
        crmPolicyNumber: match.policyNumber,
        confidence: 90,
        method: 'POLICY_NUMBER_SINGLE',
        status: classifyConfidence(90, config),
        notes: `Single CRM policy matched by policy number "${row.carrierPolicyNumber}"`,
      };
    }

    // Tier 6: Multi-match disambiguation
    if (
      isTierEnabled('POLICY_NUMBER_MULTI_BEST', config) &&
      policyNumberMatches.length > 1
    ) {
      const scored = policyNumberMatches.map((p) => {
        let score = 0;

        score +=
          dateProximityScore(p.effectiveDate, row.trueEffectiveDate) * 40;

        if (agentNameMatches(row.brokerName, p.agentName)) {
          score += 30;
        }

        const nameScore = memberNameScore(
          row.memberFirstName,
          row.memberLastName,
          p.leadFirstName,
          p.leadLastName,
        );

        score += nameScore * 20;

        if (
          row.memberDob &&
          p.leadDob &&
          row.memberDob === p.leadDob
        ) {
          score += 10;
        }

        return { policy: p, score };
      });

      scored.sort((a, b) => b.score - a.score);

      const best = scored[0];
      const confidence = Math.min(Math.round(best.score * 0.55), 70);

      return {
        crmPolicyId: best.policy.id,
        crmPolicyNumber: best.policy.policyNumber,
        confidence,
        method: 'POLICY_NUMBER_MULTI_BEST',
        status: classifyConfidence(confidence, config),
        notes: `Multiple CRM policies (${policyNumberMatches.length}) matched. Best by weighted score (${best.score.toFixed(1)}): date proximity + agent + member identity`,
      };
    }
  }

  // Tier 7: NPN + effective date + name similarity
  if (
    isTierEnabled('NPN_DATE_NAME', config) &&
    row.brokerNpn &&
    row.trueEffectiveDate &&
    row.memberFirstName &&
    row.memberLastName
  ) {
    const npnCandidates = indexes.policyByNpn.get(row.brokerNpn) ?? [];
    const npnMatches = npnCandidates.filter(
      (p) =>
        datesWithinDays(p.effectiveDate, row.trueEffectiveDate, tolerance),
    );

    for (const p of npnMatches) {
      const nameScore = memberNameScore(
        row.memberFirstName,
        row.memberLastName,
        p.leadFirstName,
        p.leadLastName,
      );

      if (nameScore >= 0.85) {
        // Dynamic confidence based on name quality:
        // NPN confirms same agent, date confirms same enrollment window.
        // Name similarity is the remaining signal — high similarity means
        // this is almost certainly the same person.
        const confidence =
          nameScore >= 0.98 ? 92 : nameScore >= 0.93 ? 88 : 65;

        return {
          crmPolicyId: p.id,
          crmPolicyNumber: p.policyNumber,
          confidence,
          method: 'NPN_DATE_NAME',
          status: classifyConfidence(confidence, config),
          notes: `NPN-based match: broker NPN ${row.brokerNpn}, name similarity ${nameScore.toFixed(2)}, effective date within ${tolerance} days`,
        };
      }
    }
  }

  // Tier 8: Name + DOB + effective date
  if (
    isTierEnabled('NAME_DOB_DATE', config) &&
    row.memberFirstName &&
    row.memberLastName &&
    row.memberDob &&
    row.trueEffectiveDate
  ) {
    const dobCandidates = indexes.policyByDob.get(row.memberDob) ?? [];

    for (const p of dobCandidates) {
      if (p.leadDob && p.leadDob === row.memberDob) {
        const nameScore = memberNameScore(
          row.memberFirstName,
          row.memberLastName,
          p.leadFirstName,
          p.leadLastName,
        );

        if (
          nameScore >= config.nameMatchThreshold &&
          datesWithinDays(p.effectiveDate, row.trueEffectiveDate, tolerance)
        ) {
          return {
            crmPolicyId: p.id,
            crmPolicyNumber: p.policyNumber,
            confidence: 60,
            method: 'NAME_DOB_DATE',
            status: classifyConfidence(60, config),
            notes: `Identity-based match: name similarity ${nameScore.toFixed(2)}, DOB ${row.memberDob} exact match, effective date within ${tolerance} days`,
          };
        }
      }
    }
  }

  // Tier 9: Unmatched — provide candidate suggestions
  const candidates: string[] = [];

  if (policyNumberMatches.length > 0) {
    candidates.push(
      `${policyNumberMatches.length} policies share policy number "${row.carrierPolicyNumber}" but could not be disambiguated`,
    );
  }

  return {
    crmPolicyId: null,
    crmPolicyNumber: null,
    confidence: 0,
    method: 'UNMATCHED',
    status: 'UNMATCHED',
    notes: candidates.length > 0
      ? `Unmatched. ${candidates.join('. ')}`
      : `No CRM policy found for carrier policy "${row.carrierPolicyNumber}"`,
  };
};
