import { defineLogicFunction } from 'twenty-sdk';
import { CoreApiClient } from 'twenty-sdk/clients';

import { MATCH_BOB_LOGIC_FUNCTION_ID } from 'src/constants/universal-identifiers';
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
import { deriveStatus } from 'src/utils/status-engine';

type RequestBody = {
  sourceFileId: string;
};

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
  lead: {
    name: { firstName: string | null; lastName: string | null } | null;
    dateOfBirth: string | null;
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
  client: CoreApiClient,
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

    const response = (await client.query({
      [queryKey]: {
        edges: { node: { ...fields, id: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
        __args: args,
      },
    })) as unknown as Record<
      string,
      {
        edges: { node: TNode }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      }
    >;

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
  derivedStatus: string | null;
  currentCrmStatus: string | null;
  derivedExpireDate: string | null;
  currentCrmExpireDate: string | null;
  hasDiscrepancy: boolean;
  discrepancyDetails: string | null;
  writeBackStatus: string | null;
  cancelPreviousPolicyId: string | null;
  suggestedPolicyNumber: string | null;
};

const handler = async (event: { body: RequestBody | null }) => {
  const body = event.body;

  if (!body?.sourceFileId) {
    throw new Error('Missing sourceFileId in request body');
  }

  const sourceFileId = body.sourceFileId;

  try {
    return await runMatching(sourceFileId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(`[match-bob] Failed: ${errorMessage}`);

    try {
      const errorClient = new CoreApiClient();

      await errorClient.mutation({
        updatePayReconSourceFile: {
          __args: {
            id: sourceFileId,
            data: {
              parseStatus: 'FAILED',
              parseError: `Matching failed: ${errorMessage.slice(0, 450)}`,
            },
          },
          id: true,
        },
      });
    } catch (updateError) {
      console.error('[match-bob] Failed to update status to FAILED', updateError);
    }

    throw error;
  }
};

const runMatching = async (sourceFileId: string) => {
  const client = new CoreApiClient();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Fetch source file to get carrier name, CRM ID, parserId, and matchingConfig
  const { payReconSourceFiles: sfResult } = (await client.query({
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
  })) as unknown as {
    payReconSourceFiles: { edges: { node: SourceFileNode }[] };
  };

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
  await client.mutation({
    updatePayReconSourceFile: {
      __args: {
        id: sourceFileId,
        data: { parseStatus: 'MATCHING' },
      },
      id: true,
    },
  });

  // Clean up existing match results for this source file (allows re-running)
  const { payReconMatchResults: existingCheck } = (await client.query({
    payReconMatchResults: {
      __args: {
        filter: { sourceFileId: { eq: sourceFileId } },
        first: 1,
      },
      totalCount: true,
    },
  })) as unknown as {
    payReconMatchResults: { totalCount: number };
  };

  if (existingCheck.totalCount > 0) {
    console.log(
      `[match-bob] Cleaning up ${existingCheck.totalCount} existing match results`,
    );

    await client.mutation({
      deletePayReconMatchResults: {
        __args: { filter: { sourceFileId: { eq: sourceFileId } } },
        id: true,
      },
    });

    console.log(`[match-bob] Cleanup complete`);
  }

  // Create ReconciliationRun record
  const runName = `${carrierName} - ${todayStr}`;

  const { createPayReconReconciliationRun: runRecord } = (await client.mutation(
    {
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
    },
  )) as unknown as {
    createPayReconReconciliationRun: { id: string };
  };

  const runId = runRecord.id;

  // Fetch all NormalizedBookRows for this source file
  const bookRows = await fetchAllPages<NbrNode>(
    client,
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
    client,
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

  const allResults: MatchResultData[] = [];

  for (const row of bookRows) {
    // Skip BOB rows with policy effective dates before Omnia's first sale
    if (
      row.policyEffectiveDate &&
      row.policyEffectiveDate < OMNIA_START_DATE
    ) {
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
    let hasDiscrepancy = false;
    let discrepancyDetails: string | null = null;
    let writeBackStatus: string | null = null;
    let cancelPreviousPolicyId: string | null = null;

    if (decision.crmPolicyId) {
      const matchedPolicy = matchIndexes.policyById.get(decision.crmPolicyId);

      currentCrmStatus = matchedPolicy?.status ?? null;
      currentCrmExpireDate = matchedPolicy?.expirationDate ?? null;

      // Get all CRM policies with the same policy number for duplicate handling
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

        // Compare derived vs current
        if (derivedStatus !== currentCrmStatus) {
          hasDiscrepancy = true;
          discrepanciesFound++;

          const details: string[] = [];

          details.push(
            `Status: CRM="${currentCrmStatus}" → Derived="${derivedStatus}"`,
          );

          if (derivedExpireDate && derivedExpireDate !== currentCrmExpireDate) {
            details.push(
              `Expire: CRM="${currentCrmExpireDate}" → Derived="${derivedExpireDate}"`,
            );
          }

          discrepancyDetails = details.join('; ');
          writeBackStatus = 'PENDING';
        }

        // Also flag if expiration dates differ even when status matches
        if (
          !hasDiscrepancy &&
          derivedExpireDate &&
          derivedExpireDate !== currentCrmExpireDate
        ) {
          hasDiscrepancy = true;
          discrepanciesFound++;
          discrepancyDetails = `Expire date: CRM="${currentCrmExpireDate}" → Derived="${derivedExpireDate}"`;
          writeBackStatus = 'PENDING';
        }
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

    allResults.push({
      name: `${policyLabel} → ${crmLabel}`,
      confidence: decision.confidence,
      matchMethod: decision.method,
      matchStatus: decision.status,
      matchNotes: enrichedNotes,
      crmPolicyId: decision.crmPolicyId,
      crmPolicyNumber: decision.crmPolicyNumber,
      normalizedBookRowId: row.id,
      sourceFileId: sourceFileId,
      derivedStatus,
      currentCrmStatus,
      derivedExpireDate,
      currentCrmExpireDate,
      hasDiscrepancy,
      discrepancyDetails,
      writeBackStatus,
      cancelPreviousPolicyId,
      suggestedPolicyNumber: null,
    });

    if (decision.status === 'AUTO_MATCHED') {
      autoMatched++;
    } else if (decision.status === 'NEEDS_REVIEW') {
      needsReview++;
    } else {
      unmatched++;
    }
  }

  // --- Policy Number Discovery (runs before MISSING_FROM_BOB) ---
  // For CRM policies that are SUBMITTED/PENDING (no real policy number yet)
  // or have a non-U policyNumber (likely an FFM ID entered by mistake),
  // try to find their real Ambetter policy number by matching BOB rows
  // using fuzzy name + exact DOB.
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
      // SUBMITTED/PENDING without a valid U-prefixed policy number
      (p.status &&
        (p.status === 'SUBMITTED' || p.status === 'PENDING') &&
        !isValidAmbetterPolicyNumber(p.policyNumber)) ||
      // Any policy with a non-U value in policyNumber (likely FFM ID mistake)
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
    // Look up BOB rows by exact DOB match
    if (!policy.leadDob) continue;

    const candidateRows = bobByDob.get(policy.leadDob);

    if (!candidateRows || candidateRows.length === 0) continue;

    // Find best fuzzy name match among candidates
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

    // Only accept if combined name match is ≥ 0.95 AND the BOB row has a valid U-prefixed policy number
    if (
      bestRow &&
      bestScore >= 0.95 &&
      isValidAmbetterPolicyNumber(bestRow.carrierPolicyNumber)
    ) {
      discoveredCount++;
      discoveredPolicyIds.add(policy.id);

      const currentPn = policy.policyNumber ?? 'none';
      const suggestedPn = bestRow.carrierPolicyNumber!;
      const discoveryNote = `Policy# discovery: "${currentPn}" → "${suggestedPn}" (name match ${bestScore.toFixed(
        3,
      )}, DOB ${policy.leadDob})`;

      // If this policy already has a phase 1 result, enrich it
      const existingResult = resultByCrmPolicyId.get(policy.id);

      // High-confidence discoveries (name match >= 0.98) are auto-approved
      // to reduce manual review burden — the DOB exact match + near-perfect
      // name match makes false positives extremely unlikely.
      const discoveryConfidence = Math.round(bestScore * 100);
      const isHighConfidenceDiscovery = bestScore >= 0.98;
      const discoveryMatchStatus = isHighConfidenceDiscovery
        ? 'AUTO_MATCHED'
        : 'NEEDS_REVIEW';
      const discoveryWriteBack = isHighConfidenceDiscovery
        ? 'APPROVED'
        : 'PENDING';

      if (existingResult) {
        existingResult.suggestedPolicyNumber = suggestedPn;
        existingResult.hasDiscrepancy = true;
        existingResult.writeBackStatus = isHighConfidenceDiscovery
          ? 'APPROVED'
          : existingResult.writeBackStatus ?? 'PENDING';
        existingResult.matchNotes = existingResult.matchNotes
          ? `${existingResult.matchNotes}. ${discoveryNote}`
          : discoveryNote;
        existingResult.discrepancyDetails = existingResult.discrepancyDetails
          ? `${existingResult.discrepancyDetails}; Policy# update: "${currentPn}" → "${suggestedPn}"`
          : `Policy# update: "${currentPn}" → "${suggestedPn}"`;
      } else {
        // No phase 1 result — create a standalone discovery result
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
          derivedStatus: null,
          currentCrmStatus: policy.status,
          derivedExpireDate: null,
          currentCrmExpireDate: policy.expirationDate,
          hasDiscrepancy: true,
          discrepancyDetails: `Policy# update: "${currentPn}" → "${suggestedPn}"`,
          writeBackStatus: discoveryWriteBack,
          cancelPreviousPolicyId: null,
          suggestedPolicyNumber: suggestedPn,
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
  // Runs after discovery so we can exclude policies that got a discovery match
  let missingFromBob = 0;

  // Statuses where a policy is too early in the pipeline to appear on a BOB
  const PRE_CARRIER_STATUSES = new Set(['SUBMITTED', 'PENDING', 'INCOMPLETE']);

  const unmatchedCrmPolicies = policies.filter(
    (p) =>
      !matchedCrmPolicyIds.has(p.id) &&
      !discoveredPolicyIds.has(p.id) &&
      p.status &&
      ACTIVE_CRM_STATUSES.has(p.status) &&
      // Skip policies with future effective dates — they won't appear in BOB yet
      !(p.effectiveDate && new Date(p.effectiveDate) > today) &&
      // Skip SUBMITTED/PENDING/INCOMPLETE policies that don't have a valid
      // carrier policy number — they haven't been processed by the carrier
      // yet, so they are EXPECTED to be absent from the BOB.
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
      derivedStatus: null,
      currentCrmStatus: policy.status,
      derivedExpireDate: null,
      currentCrmExpireDate: policy.expirationDate,
      hasDiscrepancy: true,
      discrepancyDetails: `CRM policy (${policy.status}) not found in carrier BOB. ${severity}`,
      writeBackStatus: null,
      cancelPreviousPolicyId: null,
      suggestedPolicyNumber: null,
    });

    needsReview++;
  }

  // Create MatchResult records in batches
  let created = 0;

  for (let i = 0; i < allResults.length; i += BATCH_SIZE) {
    const batch = allResults.slice(i, i + BATCH_SIZE);

    await client.mutation({
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
  await client.mutation({
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
  await client.mutation({
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

export default defineLogicFunction({
  universalIdentifier: MATCH_BOB_LOGIC_FUNCTION_ID,
  name: 'match-bob',
  description:
    'Run matching engine against parsed BOB rows to link them to CRM policies, derive statuses, and detect discrepancies',
  timeoutSeconds: 600,
  handler,
  httpRouteTriggerSettings: {
    path: '/match-bob',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
