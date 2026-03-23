import { mutationWithRetry, queryWithRetry } from 'src/utils/api-retry';
import type { FieldDiff } from 'src/utils/field-diff-engine';
import { graphqlQuery } from 'src/utils/graphql-helpers';
import { getCancelExpireDate } from 'src/utils/status-engine';

type MatchResultNode = {
  id: string;
  crmPolicyId: string | null;
  crmPolicyNumber: string | null;
  confidence: number;
  matchMethod: string | null;
  derivedStatus: string | null;
  currentCrmStatus: string | null;
  derivedExpireDate: string | null;
  currentCrmExpireDate: string | null;
  cancelPreviousPolicyId: string | null;
  writeBackStatus: string | null;
  suggestedPolicyNumber: string | null;
  fieldDiffs: FieldDiff[] | null;
  sourceFileId: string;
  normalizedBookRow: {
    trueEffectiveDate: string | null;
  } | null;
  crmPolicyLink: {
    primaryLinkUrl: string | null;
  } | null;
};

type SourceFileNode = {
  id: string;
  name: string | null;
  carrierConfig: {
    name: string | null;
  } | null;
};

type UpdatePolicyResponse = {
  data: {
    updatePolicy: { id: string } | null;
  };
};

type StatusChangeLogData = {
  name: string;
  crmPolicyId: string | null;
  crmPolicyNumber: string | null;
  oldStatus: string | null;
  newStatus: string | null;
  oldExpireDate?: string | null;
  newExpireDate?: string | null;
  source: string;
  carrierName: string;
  matchResultId: string;
  confidence: number;
  appliedAt: string;
  reverted: boolean;
  sourceFileId: string;
};

const PAGE_SIZE = 500;
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAllApprovedResults = async (
  sourceFileId: string,
): Promise<MatchResultNode[]> => {
  const results: MatchResultNode[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const args: Record<string, unknown> = {
      first: PAGE_SIZE,
      filter: {
        and: [
          { sourceFileId: { eq: sourceFileId } },
          { matchStatus: { eq: 'CONFIRMED' } },
          { writeBackStatus: { eq: 'PENDING' } },
        ],
      },
    };

    if (cursor) {
      args.after = cursor;
    }

    const response = await queryWithRetry<{
      payReconMatchResults: {
        edges: { node: MatchResultNode }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>({
      payReconMatchResults: {
        edges: {
          node: {
            id: true,
            crmPolicyId: true,
            crmPolicyNumber: true,
            confidence: true,
            matchMethod: true,
            derivedStatus: true,
            currentCrmStatus: true,
            derivedExpireDate: true,
            currentCrmExpireDate: true,
            cancelPreviousPolicyId: true,
            writeBackStatus: true,
            suggestedPolicyNumber: true,
            fieldDiffs: true,
            sourceFileId: true,
            normalizedBookRow: { trueEffectiveDate: true },
            crmPolicyLink: { primaryLinkUrl: true },
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
        __args: args,
      },
    });

    results.push(...response.payReconMatchResults.edges.map((e) => e.node));
    hasMore = response.payReconMatchResults.pageInfo.hasNextPage;
    cursor = response.payReconMatchResults.pageInfo.endCursor;
  }

  return results;
};

const updateCrmPolicy = async (
  policyId: string,
  data: {
    status?: string;
    expirationDate?: string | null;
    policyNumber?: string | null;
  },
): Promise<void> => {
  const updateData: Record<string, unknown> = {};

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.expirationDate) {
    updateData.expirationDate = data.expirationDate;
  }

  if (data.policyNumber) {
    updateData.policyNumber = data.policyNumber;
  }

  await graphqlQuery<UpdatePolicyResponse>(
    `mutation ApplyStatusUpdate($id: UUID!, $data: PolicyUpdateInput!) {
      updatePolicy(id: $id, data: $data) { id }
    }`,
    { id: policyId, data: updateData },
  );
};

const updateCrmLead = async (
  leadId: string,
  data: Record<string, unknown>,
): Promise<void> => {
  await graphqlQuery(
    `mutation ApplyLeadUpdate($id: UUID!, $data: PersonUpdateInput!) {
      updatePerson(id: $id, data: $data) { id }
    }`,
    { id: leadId, data },
  );
};

const fetchLeadIdForPolicy = async (
  policyId: string,
): Promise<string | null> => {
  const response = await graphqlQuery<{
    data: { policy: { lead: { id: string } | null } | null };
  }>(
    `query GetPolicyLead($id: UUID!) { policy(id: $id) { lead { id } } }`,
    { id: policyId },
  );

  return response.data?.policy?.lead?.id ?? null;
};

const flushStatusChangeLogs = async (
  logs: StatusChangeLogData[],
): Promise<void> => {
  if (logs.length === 0) return;

  await mutationWithRetry({
    createPayReconStatusChangeLogs: {
      __args: { data: logs },
      id: true,
    },
  });
};

const flushMatchResultUpdates = async (
  updates: { id: string; writeBackStatus: string }[],
): Promise<void> => {
  for (const update of updates) {
    await mutationWithRetry({
      updatePayReconMatchResult: {
        __args: {
          id: update.id,
          data: { writeBackStatus: update.writeBackStatus },
        },
        id: true,
      },
    });
  }
};

export const runApplyUpdates = async (sourceFileId: string) => {
  const now = new Date().toISOString();

  // Fetch source file for carrier name
  const { payReconSourceFiles: sfResult } = await queryWithRetry<{
    payReconSourceFiles: { edges: { node: SourceFileNode }[] };
  }>({
    payReconSourceFiles: {
      __args: { filter: { id: { eq: sourceFileId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          carrierConfig: { name: true },
        },
      },
    },
  });

  const sourceFile = sfResult.edges[0]?.node;
  const carrierName = sourceFile?.carrierConfig?.name ?? 'Unknown';
  const sourceName = sourceFile?.name ?? sourceFileId;

  // Fetch all approved match results
  const approvedResults = await fetchAllApprovedResults(sourceFileId);

  console.log(
    `[apply-status-updates] Found ${approvedResults.length} approved results to apply`,
  );

  let applied = 0;
  let failed = 0;
  let skipped = 0;

  // Batching accumulators
  const pendingLogs: StatusChangeLogData[] = [];
  const pendingUpdates: { id: string; writeBackStatus: string }[] = [];

  const flushPendingBatches = async () => {
    if (pendingLogs.length > 0) {
      await flushStatusChangeLogs([...pendingLogs]);
      pendingLogs.length = 0;
    }

    if (pendingUpdates.length > 0) {
      await flushMatchResultUpdates([...pendingUpdates]);
      pendingUpdates.length = 0;
    }
  };

  for (const result of approvedResults) {
    // --- Diff-driven updates (new path) ---
    const diffs: FieldDiff[] | null =
      result.fieldDiffs && Array.isArray(result.fieldDiffs)
        ? result.fieldDiffs
        : null;

    if (diffs && diffs.length > 0) {
      const approvedDiffs = diffs.filter(
        (d) => d.approval === 'APPROVED' && d.action !== 'INFO_ONLY',
      );

      if (approvedDiffs.length === 0 && !result.suggestedPolicyNumber) {
        skipped++;
        continue;
      }

      try {
        // Group by crmObjectType
        const policyDiffs = approvedDiffs.filter(
          (d) => d.crmObjectType === 'policy',
        );
        const leadDiffs = approvedDiffs.filter(
          (d) => d.crmObjectType === 'lead',
        );

        // Build policy update payload from approved diffs
        if (result.crmPolicyId && policyDiffs.length > 0) {
          const policyPayload: Record<string, unknown> = {};

          for (const diff of policyDiffs) {
            if (diff.crmField && diff.bobValue != null) {
              policyPayload[diff.crmField] = diff.bobValue;
            }
          }

          // Include suggested policy number if present
          if (result.suggestedPolicyNumber) {
            policyPayload.policyNumber = result.suggestedPolicyNumber;
          }

          if (Object.keys(policyPayload).length > 0) {
            await updateCrmPolicy(result.crmPolicyId, policyPayload);
          }
        } else if (
          result.crmPolicyId &&
          result.suggestedPolicyNumber &&
          policyDiffs.length === 0
        ) {
          // Only policy number discovery, no other policy diffs
          await updateCrmPolicy(result.crmPolicyId, {
            policyNumber: result.suggestedPolicyNumber,
          });
        }

        // Build lead update payload from approved diffs
        if (result.crmPolicyId && leadDiffs.length > 0) {
          const leadId = await fetchLeadIdForPolicy(result.crmPolicyId);

          if (leadId) {
            const leadPayload: Record<string, unknown> = {};

            for (const diff of leadDiffs) {
              if (!diff.crmField || diff.bobValue == null) continue;

              // Handle nested fields like lead.name.firstName
              if (diff.crmField === 'lead.name.firstName') {
                leadPayload.name = {
                  ...(leadPayload.name as Record<string, unknown> | undefined),
                  firstName: diff.bobValue,
                };
              } else if (diff.crmField === 'lead.name.lastName') {
                leadPayload.name = {
                  ...(leadPayload.name as Record<string, unknown> | undefined),
                  lastName: diff.bobValue,
                };
              } else if (diff.crmField === 'lead.dateOfBirth') {
                leadPayload.dateOfBirth = diff.bobValue;
              }
            }

            if (Object.keys(leadPayload).length > 0) {
              await updateCrmLead(leadId, leadPayload);

              console.log(
                `[apply-status-updates] Updated lead ${leadId} with ${leadDiffs.length} field(s)`,
              );
            }
          }
        }

        // Cancel previous policy version if needed
        if (result.cancelPreviousPolicyId) {
          const effectiveDate =
            result.normalizedBookRow?.trueEffectiveDate ?? null;
          const cancelExpireDate = effectiveDate
            ? getCancelExpireDate(effectiveDate)
            : null;

          try {
            await updateCrmPolicy(result.cancelPreviousPolicyId, {
              status: 'CANCELED',
              expirationDate: cancelExpireDate,
            });

            console.log(
              `[apply-status-updates] Canceled previous policy ${result.cancelPreviousPolicyId}`,
            );
          } catch (cancelError) {
            console.error(
              `[apply-status-updates] Failed to cancel previous policy ${result.cancelPreviousPolicyId}:`,
              cancelError,
            );
          }
        }

        // Build log name from all applied changes
        const changedFields = approvedDiffs
          .map((d) => `${d.label}: ${d.crmValue ?? '—'} → ${d.bobValue ?? '—'}`)
          .join('; ');
        const logName = `${result.crmPolicyNumber}: ${changedFields || 'policy# update'}`;

        pendingLogs.push({
          name: logName.slice(0, 255),
          crmPolicyId: result.crmPolicyId,
          crmPolicyNumber: result.crmPolicyNumber,
          oldStatus: result.currentCrmStatus,
          newStatus: result.derivedStatus ?? result.currentCrmStatus,
          oldExpireDate: result.currentCrmExpireDate,
          newExpireDate: result.derivedExpireDate,
          source: sourceName,
          carrierName,
          matchResultId: result.id,
          confidence: result.confidence,
          appliedAt: now,
          reverted: false,
          sourceFileId,
        });

        pendingUpdates.push({ id: result.id, writeBackStatus: 'APPLIED' });
        applied++;

        if (applied % 50 === 0) {
          console.log(
            `[apply-status-updates] Progress: ${applied}/${approvedResults.length} applied`,
          );
        }
      } catch (error) {
        failed++;

        console.error(
          `[apply-status-updates] Failed to apply result ${result.id}:`,
          error,
        );

        pendingUpdates.push({ id: result.id, writeBackStatus: 'FAILED' });
      }

      if (
        pendingLogs.length >= BATCH_SIZE ||
        pendingUpdates.length >= BATCH_SIZE
      ) {
        await flushPendingBatches();
        await sleep(BATCH_DELAY_MS);
      }

      continue;
    }

    // --- Legacy path (backward compat for results without fieldDiffs) ---

    // Policy Number Discovery: write the suggested policy number to CRM
    if (
      result.matchMethod === 'POLICY_NUMBER_DISCOVERY' &&
      result.suggestedPolicyNumber &&
      result.crmPolicyId
    ) {
      try {
        await updateCrmPolicy(result.crmPolicyId, {
          policyNumber: result.suggestedPolicyNumber,
        });

        pendingLogs.push({
          name: `${result.crmPolicyNumber ?? 'none'}: policy# → ${
            result.suggestedPolicyNumber
          }`,
          crmPolicyId: result.crmPolicyId,
          crmPolicyNumber: result.crmPolicyNumber,
          oldStatus: result.currentCrmStatus,
          newStatus: result.currentCrmStatus,
          source: sourceName,
          carrierName,
          matchResultId: result.id,
          confidence: result.confidence,
          appliedAt: now,
          reverted: false,
          sourceFileId,
        });

        pendingUpdates.push({ id: result.id, writeBackStatus: 'APPLIED' });
        applied++;
      } catch (error) {
        failed++;

        console.error(
          `[apply-status-updates] Failed policy# discovery for ${result.id}:`,
          error,
        );

        pendingUpdates.push({ id: result.id, writeBackStatus: 'FAILED' });
      }

      if (
        pendingLogs.length >= BATCH_SIZE ||
        pendingUpdates.length >= BATCH_SIZE
      ) {
        await flushPendingBatches();
        await sleep(BATCH_DELAY_MS);
      }

      continue;
    }

    if (!result.crmPolicyId || !result.derivedStatus) {
      skipped++;
      continue;
    }

    try {
      await updateCrmPolicy(result.crmPolicyId, {
        status: result.derivedStatus,
        expirationDate: result.derivedExpireDate,
        policyNumber: result.suggestedPolicyNumber,
      });

      // Cancel previous policy version if needed
      if (result.cancelPreviousPolicyId) {
        const effectiveDate =
          result.normalizedBookRow?.trueEffectiveDate ?? null;
        const cancelExpireDate = effectiveDate
          ? getCancelExpireDate(effectiveDate)
          : null;

        try {
          await updateCrmPolicy(result.cancelPreviousPolicyId, {
            status: 'CANCELED',
            expirationDate: cancelExpireDate,
          });

          console.log(
            `[apply-status-updates] Canceled previous policy ${result.cancelPreviousPolicyId}`,
          );
        } catch (cancelError) {
          console.error(
            `[apply-status-updates] Failed to cancel previous policy ${result.cancelPreviousPolicyId}:`,
            cancelError,
          );
        }
      }

      const logName = result.suggestedPolicyNumber
        ? `${result.crmPolicyNumber}: ${result.currentCrmStatus} → ${result.derivedStatus} (policy# → ${result.suggestedPolicyNumber})`
        : `${result.crmPolicyNumber}: ${result.currentCrmStatus} → ${result.derivedStatus}`;

      pendingLogs.push({
        name: logName,
        crmPolicyId: result.crmPolicyId,
        crmPolicyNumber: result.crmPolicyNumber,
        oldStatus: result.currentCrmStatus,
        newStatus: result.derivedStatus,
        oldExpireDate: result.currentCrmExpireDate,
        newExpireDate: result.derivedExpireDate,
        source: sourceName,
        carrierName,
        matchResultId: result.id,
        confidence: result.confidence,
        appliedAt: now,
        reverted: false,
        sourceFileId,
      });

      pendingUpdates.push({ id: result.id, writeBackStatus: 'APPLIED' });
      applied++;

      if (applied % 50 === 0) {
        console.log(
          `[apply-status-updates] Progress: ${applied}/${approvedResults.length} applied`,
        );
      }
    } catch (error) {
      failed++;

      console.error(
        `[apply-status-updates] Failed to apply result ${result.id}:`,
        error,
      );

      pendingUpdates.push({ id: result.id, writeBackStatus: 'FAILED' });
    }

    if (
      pendingLogs.length >= BATCH_SIZE ||
      pendingUpdates.length >= BATCH_SIZE
    ) {
      await flushPendingBatches();
      await sleep(BATCH_DELAY_MS);
    }
  }

  // Flush remaining
  await flushPendingBatches();

  // Update ReconciliationRun if one exists for this source file
  try {
    const { payReconReconciliationRuns: runResult } = await queryWithRetry<{
      payReconReconciliationRuns: { edges: { node: { id: string } }[] };
    }>({
      payReconReconciliationRuns: {
        __args: {
          filter: { sourceFileId: { eq: sourceFileId } },
          first: 1,
        },
        edges: { node: { id: true } },
      },
    });

    const runId = runResult.edges[0]?.node?.id;

    if (runId) {
      await mutationWithRetry({
        updatePayReconReconciliationRun: {
          __args: {
            id: runId,
            data: {
              statusUpdatesApplied: applied,
              runStatus: 'COMPLETED',
              completedAt: now,
            },
          },
          id: true,
        },
      });
    }
  } catch (runError) {
    console.error(
      '[apply-status-updates] Failed to update ReconciliationRun:',
      runError,
    );
  }

  // Update pipeline status to DONE
  await mutationWithRetry({
    updatePayReconSourceFile: {
      __args: {
        id: sourceFileId,
        data: { parseStatus: 'DONE' },
      },
      id: true,
    },
  });

  const total = approvedResults.length;

  console.log(
    `[apply-status-updates] Complete: ${applied} applied, ${failed} failed, ${skipped} skipped out of ${total}`,
  );

  return { applied, failed, skipped, total };
};
