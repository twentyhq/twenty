import { mutationWithRetry, queryWithRetry } from 'src/utils/api-retry';
import {
  computeFieldDiffs,
  summarizeDiffs,
  type FieldDiff,
} from 'src/utils/field-diff-engine';
import { graphqlQuery } from 'src/utils/graphql-helpers';
import {
  buildMatchIndexes,
  combinedNameFuzzyMatch,
  DEFAULT_MATCHING_CONFIG,
  isValidAmbetterPolicyNumber,
  matchRow,
  type BobRow,
  type CrmPolicy,
  type MatchingConfig,
  type Override,
} from 'src/utils/matching-engine';
import { deriveStatus, type OmniaStatus } from 'src/utils/status-engine';

type NbrNode = {
  id: string;
  carrierPolicyNumber: string | null;
  brokerName: string | null;
  brokerNpn: string | null;
  policyEffectiveDate: string | null;
  brokerEffectiveDate: string | null;
  trueEffectiveDate: string | null;
  memberFirstName: string | null;
  memberLastName: string | null;
  memberDob: string | null;
  paidThroughDate: string | null;
  termDate: string | null;
  eligibleForCommission: boolean | null;
  planName: string | null;
  memberPhone: string | null;
  memberEmail: string | null;
};

type OverrideNode = {
  id: string;
  carrierPolicyNumber: string;
  carrierName: string;
  crmPolicyId: string;
  isActive: boolean;
};

type SourceFileNode = {
  id: string;
  name: string | null;
  carrierConfig: {
    name: string | null;
    carrierCrmId: string | null;
    parserId: string | null;
    matchingConfig: MatchingConfig | null;
  } | null;
};

type PolicyNode = {
  id: string;
  policyNumber: string | null;
  applicationId: string | null;
  effectiveDate: string | null;
  expirationDate: string | null;
  status: string | null;
  planIdentifier: string | null;
  lead: {
    id: string | null;
    name: { firstName: string | null; lastName: string | null } | null;
    dateOfBirth: string | null;
    phones: { primaryPhoneNumber: string | null } | null;
    emails: { primaryEmail: string | null } | null;
  } | null;
  agent: {
    name: string | null;
    npn: string | null;
  } | null;
};

type PoliciesResponse = {
  data: {
    policies: {
      edges: { node: PolicyNode }[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  };
};

type MatchResultData = {
  name: string;
  confidence: number;
  matchMethod: string;
  matchStatus: string;
  matchNotes: string;
  crmPolicyId: string | null;
  crmPolicyNumber: string | null;
  normalizedBookRowId: string | null;
  sourceFileId: string;
  reconciliationRunId: string;
  derivedStatus: string | null;
  currentCrmStatus: string | null;
  derivedExpireDate: string | null;
  currentCrmExpireDate: string | null;
  hasDiscrepancy: boolean;
  discrepancyDetails: string | null;
  writeBackStatus: string | null;
  cancelPreviousPolicyId: string | null;
  suggestedPolicyNumber: string | null;
  crmPolicyLink: {
    primaryLinkUrl: string;
    primaryLinkLabel: string;
  } | null;
  fieldDiffs: FieldDiff[] | null;
};

const BATCH_SIZE = 20;
const PAGE_SIZE = 500;
const BATCH_DELAY_MS = 100;

// Omnia's first sale date — exclude anything before this
const OMNIA_START_DATE = '2025-07-09';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Non-cancel statuses that should appear in BOB
const ACTIVE_CRM_STATUSES = new Set([
  'SUBMITTED',
  'PENDING',
  'ACTIVE_APPROVED',
  'ACTIVE_PLACED',
  'ACTIVE',
  'PAYMENT_ERROR_ACTIVE_APPROVED',
  'PAYMENT_ERROR_ACTIVE_PLACED',
]);

const fetchAllPages = async <TNode>(
  queryKey: string,
  fields: Record<string, boolean | Record<string, boolean>>,
  filter?: Record<string, unknown>,
): Promise<TNode[]> => {
  const results: TNode[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const args: Record<string, unknown> = { first: PAGE_SIZE };

    if (filter) {
      args.filter = filter;
    }

    if (cursor) {
      args.after = cursor;
    }

    const response = await queryWithRetry<
      Record<
        string,
        {
          edges: { node: TNode }[];
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
        }
      >
    >({
      [queryKey]: {
        edges: { node: { ...fields, id: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
        __args: args,
      },
    });

    const data = response[queryKey];

    results.push(...data.edges.map((e) => e.node));
    hasMore = data.pageInfo.hasNextPage;
    cursor = data.pageInfo.endCursor;
  }

  return results;
};

const fetchCrmPolicies = async (
  carrierCrmId?: string | null,
): Promise<CrmPolicy[]> => {
  const policies: CrmPolicy[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const variables: Record<string, unknown> = { first: 500 };

    if (carrierCrmId) {
      variables.carrierId = carrierCrmId;
    }

    if (cursor) {
      variables.after = cursor;
    }

    // Lean query — only fields needed by matching engine.
    // Extra fields (phones, emails, planIdentifier, leadId) are fetched
    // later only for matched policies to avoid overloading the server.
    const query = carrierCrmId
      ? `query MatchPolicies($carrierId: UUID!, $first: Int!, $after: String) {
          policies(
            filter: { carrierId: { eq: $carrierId } },
            first: $first,
            after: $after
          ) {
            edges {
              node {
                id policyNumber applicationId effectiveDate expirationDate status
                lead { name { firstName lastName } dateOfBirth }
                agent { name npn }
              }
            }
            pageInfo { hasNextPage endCursor }
          }
        }`
      : `query MatchPolicies($first: Int!, $after: String) {
          policies(
            first: $first,
            after: $after
          ) {
            edges {
              node {
                id policyNumber applicationId effectiveDate expirationDate status
                lead { name { firstName lastName } dateOfBirth }
                agent { name npn }
              }
            }
            pageInfo { hasNextPage endCursor }
          }
        }`;

    const response = await graphqlQuery<PoliciesResponse>(query, variables);

    for (const edge of response.data.policies.edges) {
      const p = edge.node;

      policies.push({
        id: p.id,
        policyNumber: p.policyNumber,
        applicationId: p.applicationId ?? null,
        effectiveDate: p.effectiveDate,
        expirationDate: p.expirationDate ?? null,
        status: p.status ?? null,
        leadFirstName: p.lead?.name?.firstName ?? null,
        leadLastName: p.lead?.name?.lastName ?? null,
        leadDob: p.lead?.dateOfBirth ?? null,
        agentName: p.agent?.name ?? null,
        agentNpn: p.agent?.npn ?? null,
        // Extra fields populated by enrichMatchedPolicies() after matching
        planIdentifier: null,
        leadPhone: null,
        leadEmail: null,
        leadId: null,
      });
    }

    hasMore = response.data.policies.pageInfo.hasNextPage;
    cursor = response.data.policies.pageInfo.endCursor;
  }

  console.log(
    `[match-bob] Fetched ${policies.length} CRM policies for matching`,
  );

  return policies;
};

export const runMatching = async (sourceFileId: string) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Fetch source file to get carrier name, CRM ID, parserId, and matchingConfig
  const { payReconSourceFiles: sfResult } = await queryWithRetry<{
    payReconSourceFiles: { edges: { node: SourceFileNode }[] };
  }>({
    payReconSourceFiles: {
      __args: { filter: { id: { eq: sourceFileId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          carrierConfig: {
            name: true,
            carrierCrmId: true,
            parserId: true,
            matchingConfig: true,
          },
        },
      },
    },
  });

  const sourceFile = sfResult.edges[0]?.node;

  if (!sourceFile) {
    throw new Error(`SourceFile ${sourceFileId} not found`);
  }

  const carrierName = sourceFile?.carrierConfig?.name ?? 'Unknown';
  const carrierCrmId = sourceFile?.carrierConfig?.carrierCrmId;
  const parserId = sourceFile?.carrierConfig?.parserId ?? 'ambetter-bob-v1';
  const matchingConfig: MatchingConfig =
    sourceFile?.carrierConfig?.matchingConfig ?? DEFAULT_MATCHING_CONFIG;

  // Update pipeline status to MATCHING
  await mutationWithRetry({
    updatePayReconSourceFile: {
      __args: {
        id: sourceFileId,
        data: { parseStatus: 'MATCHING' },
      },
      id: true,
    },
  });

  // Clean up existing match results for this source file (allows re-running)
  const { payReconMatchResults: existingCheck } = await queryWithRetry<{
    payReconMatchResults: { totalCount: number };
  }>({
    payReconMatchResults: {
      __args: {
        filter: { sourceFileId: { eq: sourceFileId } },
        first: 1,
      },
      totalCount: true,
    },
  });

  if (existingCheck.totalCount > 0) {
    console.log(
      `[match-bob] Cleaning up ${existingCheck.totalCount} existing match results`,
    );

    await mutationWithRetry({
      deletePayReconMatchResults: {
        __args: { filter: { sourceFileId: { eq: sourceFileId } } },
        id: true,
      },
    });

    console.log(`[match-bob] Cleanup complete`);
  }

  // Create ReconciliationRun record
  const runName = `${carrierName} - ${todayStr}`;

  const { createPayReconReconciliationRun: runRecord } =
    await mutationWithRetry<{
      createPayReconReconciliationRun: { id: string };
    }>({
      createPayReconReconciliationRun: {
        __args: {
          data: {
            name: runName,
            runStatus: 'MATCHING',
            sourceFileId: sourceFileId,
          },
        },
        id: true,
      },
    });

  const runId = runRecord.id;

  // Fetch all NormalizedBookRows for this source file
  const bookRows = await fetchAllPages<NbrNode>(
    'payReconNormalizedBookRows',
    {
      carrierPolicyNumber: true,
      brokerName: true,
      brokerNpn: true,
      policyEffectiveDate: true,
      brokerEffectiveDate: true,
      trueEffectiveDate: true,
      memberFirstName: true,
      memberLastName: true,
      memberDob: true,
      paidThroughDate: true,
      termDate: true,
      eligibleForCommission: true,
      planName: true,
      memberPhone: true,
      memberEmail: true,
    },
    { sourceFileId: { eq: sourceFileId } },
  );

  // Fetch CRM policies (enriched) from workspace API
  const policies = await fetchCrmPolicies(carrierCrmId);

  // Build indexes for O(1) lookups in matching engine
  const matchIndexes = buildMatchIndexes(policies);

  // Alias policyByNumber for status derivation
  const policyNumberMap = matchIndexes.policyByNumber;

  // Fetch active overrides for this carrier
  const overrides = await fetchAllPages<OverrideNode>(
    'payReconMatchOverrides',
    {
      carrierPolicyNumber: true,
      carrierName: true,
      crmPolicyId: true,
      isActive: true,
    },
    { isActive: { eq: true } },
  );

  const overrideRecords: Override[] = overrides.map((o) => ({
    carrierPolicyNumber: o.carrierPolicyNumber,
    carrierName: o.carrierName,
    crmPolicyId: o.crmPolicyId,
    isActive: o.isActive,
  }));

  console.log(
    `[match-bob] Starting: ${bookRows.length} rows, ${policies.length} policies, ${overrides.length} overrides`,
  );

  // Run matching engine on all rows
  let autoMatched = 0;
  let needsReview = 0;
  let unmatched = 0;
  let discrepanciesFound = 0;
  const matchedCrmPolicyIds = new Set<string>();

  // Phase 1: Match all rows + derive status (lean — no extra policy fields needed)
  type PendingResult = {
    row: NbrNode;
    derivedStatus: string | null;
    currentCrmStatus: string | null;
    derivedExpireDate: string | null;
    currentCrmExpireDate: string | null;
    cancelPreviousPolicyId: string | null;
    statusChangeReason: string | null;
    matchedPolicyId: string | null;
    result: MatchResultData;
  };

  const pendingResults: PendingResult[] = [];
  const allResults: MatchResultData[] = [];

  for (const row of bookRows) {
    // Skip BOB rows with policy effective dates before Omnia's first sale
    if (row.policyEffectiveDate && row.policyEffectiveDate < OMNIA_START_DATE) {
      continue;
    }

    const bobRow: BobRow = {
      carrierPolicyNumber: row.carrierPolicyNumber,
      brokerName: row.brokerName,
      brokerNpn: row.brokerNpn,
      trueEffectiveDate: row.trueEffectiveDate,
      memberFirstName: row.memberFirstName,
      memberLastName: row.memberLastName,
      memberDob: row.memberDob,
    };

    const decision = matchRow(
      bobRow,
      matchIndexes,
      overrideRecords,
      carrierName,
      matchingConfig,
    );

    if (decision.crmPolicyId) {
      matchedCrmPolicyIds.add(decision.crmPolicyId);
    }

    // Status derivation for matched rows
    let derivedStatus: string | null = null;
    let currentCrmStatus: string | null = null;
    let derivedExpireDate: string | null = null;
    let currentCrmExpireDate: string | null = null;
    let cancelPreviousPolicyId: string | null = null;
    let statusChangeReason: string | null = null;

    if (decision.crmPolicyId) {
      const matchedPolicy = matchIndexes.policyById.get(decision.crmPolicyId);

      currentCrmStatus = matchedPolicy?.status ?? null;
      currentCrmExpireDate = matchedPolicy?.expirationDate ?? null;

      const allPoliciesForNumber = row.carrierPolicyNumber
        ? policyNumberMap.get(row.carrierPolicyNumber) ?? []
        : [];

      const statusResult = deriveStatus(
        parserId,
        {
          trueEffectiveDate: row.trueEffectiveDate,
          paidThroughDate: row.paidThroughDate,
          termDate: row.termDate,
          eligibleForCommission: row.eligibleForCommission,
        },
        allPoliciesForNumber,
        today,
      );

      if (statusResult) {
        derivedStatus = statusResult.derivedStatus;
        derivedExpireDate = statusResult.derivedExpireDate;
        cancelPreviousPolicyId = statusResult.cancelPreviousPolicyId;
        statusChangeReason = statusResult.statusChangeReason;
      }
    }

    const policyLabel = row.carrierPolicyNumber ?? 'unknown';
    const crmLabel = decision.crmPolicyNumber ?? 'none';

    // For unmatched BOB rows, classify by Jackie's broker-effective-date rule:
    // - Canceled or paid > 1 day before broker effective → flag for audit research
    // - Active and paid current → genuine gap, needs CRM record
    let enrichedNotes = decision.notes;

    if (decision.method === 'UNMATCHED' && row.brokerEffectiveDate) {
      const brokerEff = new Date(row.brokerEffectiveDate);
      const paidThru = row.paidThroughDate
        ? new Date(row.paidThroughDate)
        : null;
      const oneDayBeforeBrokerEff = new Date(brokerEff);

      oneDayBeforeBrokerEff.setDate(oneDayBeforeBrokerEff.getDate() - 1);

      if (row.eligibleForCommission === false) {
        enrichedNotes += '. CANCELED — flag for audit research';
      } else if (
        paidThru &&
        paidThru.getTime() < oneDayBeforeBrokerEff.getTime()
      ) {
        enrichedNotes += `. PAID BEFORE BROKER EFFECTIVE (paid thru ${row.paidThroughDate}, broker eff ${row.brokerEffectiveDate}) — flag for audit research`;
      } else {
        enrichedNotes += `. ACTIVE policy not in CRM (broker eff ${row.brokerEffectiveDate}) — needs CRM record`;
      }
    }

    const resultData: MatchResultData = {
      name: `${policyLabel} → ${crmLabel}`,
      confidence: decision.confidence,
      matchMethod: decision.method,
      matchStatus: decision.status,
      matchNotes: enrichedNotes,
      crmPolicyId: decision.crmPolicyId,
      crmPolicyNumber: decision.crmPolicyNumber,
      normalizedBookRowId: row.id,
      sourceFileId: sourceFileId,
      reconciliationRunId: runId,
      derivedStatus,
      currentCrmStatus,
      derivedExpireDate,
      currentCrmExpireDate,
      hasDiscrepancy: false,
      discrepancyDetails: null,
      writeBackStatus: null,
      cancelPreviousPolicyId,
      suggestedPolicyNumber: null,
      crmPolicyLink: decision.crmPolicyId
        ? {
            primaryLinkUrl: `https://crm.omniaagent.com/objects/policy/${decision.crmPolicyId}`,
            primaryLinkLabel: decision.crmPolicyNumber || 'View Policy',
          }
        : null,
      fieldDiffs: null,
    };

    allResults.push(resultData);

    // Track matched rows for phase 2 diff enrichment
    if (decision.crmPolicyId) {
      pendingResults.push({
        row,
        derivedStatus,
        currentCrmStatus,
        derivedExpireDate,
        currentCrmExpireDate,
        cancelPreviousPolicyId,
        statusChangeReason,
        matchedPolicyId: decision.crmPolicyId,
        result: resultData,
      });
    }

    if (decision.status === 'AUTO_MATCHED') {
      autoMatched++;
    } else if (decision.status === 'NEEDS_REVIEW') {
      needsReview++;
    } else {
      unmatched++;
    }
  }

  // --- Phase 2: Enrich matched policies with extra fields + compute diffs ---
  // Fetch extra CRM fields (phones, emails, planIdentifier) only for matched
  // policies to avoid the heavy joins that crash the server during bulk fetch.
  const uniqueMatchedIds = [...new Set(pendingResults.map((p) => p.matchedPolicyId!))];

  if (uniqueMatchedIds.length > 0) {
    console.log(
      `[match-bob] Enriching ${uniqueMatchedIds.length} matched policies for diff computation`,
    );

    type EnrichedPolicyNode = {
      id: string;
      planIdentifier: string | null;
      lead: {
        id: string | null;
        phones: { primaryPhoneNumber: string | null } | null;
        emails: { primaryEmail: string | null } | null;
      } | null;
    };

    // Fetch in batches of 50 to avoid oversized queries
    const ENRICH_BATCH = 50;
    const enrichedMap = new Map<string, EnrichedPolicyNode>();

    for (let i = 0; i < uniqueMatchedIds.length; i += ENRICH_BATCH) {
      const batchIds = uniqueMatchedIds.slice(i, i + ENRICH_BATCH);

      try {
        const enrichResult = await graphqlQuery<{
          data: {
            policies: {
              edges: { node: EnrichedPolicyNode }[];
            };
          };
        }>(
          `query EnrichPolicies($ids: [UUID!], $first: Int!) {
            policies(filter: { id: { in: $ids } }, first: $first) {
              edges {
                node {
                  id planIdentifier
                  lead { id phones { primaryPhoneNumber } emails { primaryEmail } }
                }
              }
            }
          }`,
          { ids: batchIds, first: batchIds.length },
        );

        for (const edge of enrichResult.data.policies.edges) {
          enrichedMap.set(edge.node.id, edge.node);
        }
      } catch (enrichError) {
        console.warn(
          `[match-bob] Failed to enrich batch ${i / ENRICH_BATCH + 1}, diffs will use partial data:`,
          enrichError,
        );
      }

      if (i + ENRICH_BATCH < uniqueMatchedIds.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    // Compute diffs for each matched result using enriched data
    for (const pending of pendingResults) {
      const matchedPolicy = matchIndexes.policyById.get(pending.matchedPolicyId!);

      if (!matchedPolicy) continue;

      const enriched = enrichedMap.get(pending.matchedPolicyId!);

      // Merge enriched fields into the policy data for diff computation
      const policyForDiff = {
        status: matchedPolicy.status,
        expirationDate: matchedPolicy.expirationDate,
        effectiveDate: matchedPolicy.effectiveDate,
        policyNumber: matchedPolicy.policyNumber,
        planIdentifier: enriched?.planIdentifier ?? null,
        leadFirstName: matchedPolicy.leadFirstName,
        leadLastName: matchedPolicy.leadLastName,
        leadDob: matchedPolicy.leadDob,
        agentName: matchedPolicy.agentName,
        agentNpn: matchedPolicy.agentNpn,
        leadPhone: enriched?.lead?.phones?.primaryPhoneNumber ?? null,
        leadEmail: enriched?.lead?.emails?.primaryEmail ?? null,
      };

      const statusResult =
        pending.derivedStatus != null
          ? {
              derivedStatus: pending.derivedStatus as OmniaStatus,
              derivedExpireDate: pending.derivedExpireDate,
              cancelPreviousPolicyId: pending.cancelPreviousPolicyId,
              statusChangeReason: pending.statusChangeReason ?? '',
            }
          : null;

      const diffs = computeFieldDiffs(
        {
          memberFirstName: pending.row.memberFirstName,
          memberLastName: pending.row.memberLastName,
          memberDob: pending.row.memberDob,
          brokerName: pending.row.brokerName,
          brokerNpn: pending.row.brokerNpn,
          trueEffectiveDate: pending.row.trueEffectiveDate,
          carrierPolicyNumber: pending.row.carrierPolicyNumber,
          planName: pending.row.planName,
          memberPhone: pending.row.memberPhone,
          memberEmail: pending.row.memberEmail,
        },
        policyForDiff,
        statusResult,
      );

      if (diffs.length > 0) {
        pending.result.fieldDiffs = diffs;
        pending.result.hasDiscrepancy = true;
        discrepanciesFound++;
        pending.result.discrepancyDetails = summarizeDiffs(diffs);
        pending.result.writeBackStatus = diffs.some(
          (d) => d.action !== 'INFO_ONLY',
        )
          ? 'PENDING'
          : null;
      }
    }

    console.log(
      `[match-bob] Diff enrichment complete: ${discrepanciesFound} discrepancies found`,
    );
  }

  // --- Policy Number Discovery (runs before MISSING_FROM_BOB) ---
  let discoveredCount = 0;
  const discoveredPolicyIds = new Set<string>();

  // Build DOB index of BOB rows for fast lookup
  const bobByDob = new Map<string, NbrNode[]>();

  for (const row of bookRows) {
    if (row.memberDob) {
      const existing = bobByDob.get(row.memberDob) ?? [];

      existing.push(row);
      bobByDob.set(row.memberDob, existing);
    }
  }

  // Find CRM policies that need policy number discovery
  const discoveryPolicies = policies.filter(
    (p) =>
      (p.status &&
        (p.status === 'SUBMITTED' || p.status === 'PENDING') &&
        !isValidAmbetterPolicyNumber(p.policyNumber)) ||
      (p.policyNumber &&
        p.policyNumber.trim().length > 0 &&
        !isValidAmbetterPolicyNumber(p.policyNumber)),
  );

  console.log(
    `[match-bob] Policy Number Discovery: checking ${discoveryPolicies.length} CRM policies`,
  );

  // Build index of existing phase 1 results by crmPolicyId for enrichment
  const resultByCrmPolicyId = new Map<string, MatchResultData>();

  for (const r of allResults) {
    if (r.crmPolicyId) {
      resultByCrmPolicyId.set(r.crmPolicyId, r);
    }
  }

  for (const policy of discoveryPolicies) {
    if (!policy.leadDob) continue;

    const candidateRows = bobByDob.get(policy.leadDob);

    if (!candidateRows || candidateRows.length === 0) continue;

    let bestRow: NbrNode | null = null;
    let bestScore = 0;

    for (const row of candidateRows) {
      const score = combinedNameFuzzyMatch(
        row.memberFirstName,
        row.memberLastName,
        policy.leadFirstName,
        policy.leadLastName,
      );

      if (score > bestScore) {
        bestScore = score;
        bestRow = row;
      }
    }

    if (
      bestRow &&
      bestScore >= 0.95 &&
      isValidAmbetterPolicyNumber(bestRow.carrierPolicyNumber) &&
      !matchIndexes.policyByNumber.has(bestRow.carrierPolicyNumber!)
    ) {
      discoveredCount++;
      discoveredPolicyIds.add(policy.id);

      const currentPn = policy.policyNumber ?? 'none';
      const suggestedPn = bestRow.carrierPolicyNumber!;
      const discoveryNote = `Policy# discovery: "${currentPn}" → "${suggestedPn}" (name match ${bestScore.toFixed(
        3,
      )}, DOB ${policy.leadDob})`;

      const existingResult = resultByCrmPolicyId.get(policy.id);

      const discoveryConfidence = Math.round(bestScore * 100);
      const isHighConfidenceDiscovery = bestScore >= 0.98;
      const discoveryMatchStatus = isHighConfidenceDiscovery
        ? 'AUTO_MATCHED'
        : 'NEEDS_REVIEW';
      const discoveryWriteBack = 'PENDING';

      if (existingResult) {
        existingResult.suggestedPolicyNumber = suggestedPn;
        existingResult.hasDiscrepancy = true;
        existingResult.writeBackStatus =
          existingResult.writeBackStatus ?? 'PENDING';
        existingResult.matchNotes = existingResult.matchNotes
          ? `${existingResult.matchNotes}. ${discoveryNote}`
          : discoveryNote;
        existingResult.discrepancyDetails = existingResult.discrepancyDetails
          ? `${existingResult.discrepancyDetails}; Policy# update: "${currentPn}" → "${suggestedPn}"`
          : `Policy# update: "${currentPn}" → "${suggestedPn}"`;
      } else {
        allResults.push({
          name: `DISCOVER: ${currentPn} → ${suggestedPn}`,
          confidence: discoveryConfidence,
          matchMethod: 'POLICY_NUMBER_DISCOVERY',
          matchStatus: discoveryMatchStatus,
          matchNotes: discoveryNote,
          crmPolicyId: policy.id,
          crmPolicyNumber: policy.policyNumber,
          normalizedBookRowId: bestRow.id,
          sourceFileId: sourceFileId,
          reconciliationRunId: runId,
          derivedStatus: null,
          currentCrmStatus: policy.status,
          derivedExpireDate: null,
          currentCrmExpireDate: policy.expirationDate,
          hasDiscrepancy: true,
          discrepancyDetails: `Policy# update: "${currentPn}" → "${suggestedPn}"`,
          writeBackStatus: discoveryWriteBack,
          cancelPreviousPolicyId: null,
          suggestedPolicyNumber: suggestedPn,
          crmPolicyLink: {
            primaryLinkUrl: `https://crm.omniaagent.com/objects/policy/${policy.id}`,
            primaryLinkLabel: policy.policyNumber || 'View Policy',
          },
          fieldDiffs: null,
        });

        if (isHighConfidenceDiscovery) {
          autoMatched++;
        } else {
          needsReview++;
        }
      }
    }
  }

  console.log(
    `[match-bob] Policy Number Discovery: found ${discoveredCount} policy numbers`,
  );

  // --- Two-way reconciliation: CRM→BOB gap detection ---
  let missingFromBob = 0;

  if (matchingConfig.enableMissingFromBob) {
    const PRE_CARRIER_STATUSES = new Set([
      'SUBMITTED',
      'PENDING',
      'INCOMPLETE',
    ]);

    const unmatchedCrmPolicies = policies.filter(
      (p) =>
        !matchedCrmPolicyIds.has(p.id) &&
        !discoveredPolicyIds.has(p.id) &&
        p.status &&
        ACTIVE_CRM_STATUSES.has(p.status) &&
        !(p.effectiveDate && new Date(p.effectiveDate) > today) &&
        !(
          PRE_CARRIER_STATUSES.has(p.status) &&
          !isValidAmbetterPolicyNumber(p.policyNumber)
        ),
    );

    for (const policy of unmatchedCrmPolicies) {
      missingFromBob++;

      const hasCarrierPn = isValidAmbetterPolicyNumber(policy.policyNumber);
      const severity = hasCarrierPn
        ? 'Has carrier policy# — should be on BOB'
        : 'No carrier policy# — may need policy# discovery';

      allResults.push({
        name: `MISSING: ${policy.policyNumber ?? 'unknown'}`,
        confidence: 0,
        matchMethod: 'MISSING_FROM_BOB',
        matchStatus: 'NEEDS_REVIEW',
        matchNotes: `CRM policy ${policy.policyNumber} (${policy.status}) not found in carrier BOB. ${severity}`,
        crmPolicyId: policy.id,
        crmPolicyNumber: policy.policyNumber,
        normalizedBookRowId: null,
        sourceFileId: sourceFileId,
        reconciliationRunId: runId,
        derivedStatus: null,
        currentCrmStatus: policy.status,
        derivedExpireDate: null,
        currentCrmExpireDate: policy.expirationDate,
        hasDiscrepancy: true,
        discrepancyDetails: `CRM policy (${policy.status}) not found in carrier BOB. ${severity}`,
        writeBackStatus: null,
        cancelPreviousPolicyId: null,
        suggestedPolicyNumber: null,
        crmPolicyLink: {
          primaryLinkUrl: `https://crm.omniaagent.com/objects/policy/${policy.id}`,
          primaryLinkLabel: policy.policyNumber || 'View Policy',
        },
        fieldDiffs: null,
      });

      needsReview++;
    }
  } else {
    console.log(
      `[match-bob] MISSING_FROM_BOB detection skipped (1-way reconciliation). Set enableMissingFromBob=true in carrier matchingConfig for 2-way.`,
    );
  }

  // Create MatchResult records in batches
  let created = 0;

  for (let i = 0; i < allResults.length; i += BATCH_SIZE) {
    const batch = allResults.slice(i, i + BATCH_SIZE);

    await mutationWithRetry({
      createPayReconMatchResults: {
        __args: { data: batch },
        id: true,
      },
    });

    created += batch.length;

    if (created % 200 === 0 || created === allResults.length) {
      console.log(
        `[match-bob] Progress: ${created}/${allResults.length} results created`,
      );
    }

    // Throttle to avoid overwhelming the worker queue
    if (i + BATCH_SIZE < allResults.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  const total = bookRows.length;

  // Update ReconciliationRun with final counts
  await mutationWithRetry({
    updatePayReconReconciliationRun: {
      __args: {
        id: runId,
        data: {
          totalBobRows: total,
          autoMatched,
          needsReview,
          unmatched,
          missingFromBob,
          discrepanciesFound,
          runStatus: 'MATCHED',
          matchedAt: new Date().toISOString(),
        },
      },
      id: true,
    },
  });

  // Update pipeline status to MATCHED
  await mutationWithRetry({
    updatePayReconSourceFile: {
      __args: {
        id: sourceFileId,
        data: { parseStatus: 'MATCHED' },
      },
      id: true,
    },
  });

  console.log(
    `[match-bob] Complete: ${autoMatched} auto-matched, ${needsReview} needs review, ${unmatched} unmatched, ${missingFromBob} missing from BOB, ${discrepanciesFound} discrepancies out of ${total}`,
  );

  return {
    autoMatched,
    needsReview,
    unmatched,
    missingFromBob,
    discrepanciesFound,
    total,
    reconciliationRunId: runId,
  };
};
