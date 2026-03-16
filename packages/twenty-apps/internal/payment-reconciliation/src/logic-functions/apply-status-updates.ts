import { defineLogicFunction } from 'twenty-sdk';
import { CoreApiClient } from 'twenty-sdk/generated';

import { APPLY_STATUS_UPDATES_LOGIC_FUNCTION_ID } from 'src/constants/universal-identifiers';
import { graphqlQuery } from 'src/utils/graphql-helpers';
import { getCancelExpireDate } from 'src/utils/status-engine';

type RequestBody = {
  sourceFileId: string;
};

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
  sourceFileId: string;
  normalizedBookRow: {
    trueEffectiveDate: string | null;
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

const PAGE_SIZE = 500;
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAllApprovedResults = async (
  client: CoreApiClient,
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
          { writeBackStatus: { eq: 'APPROVED' } },
        ],
      },
    };

    if (cursor) {
      args.after = cursor;
    }

    const response = (await client.query({
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
            sourceFileId: true,
            normalizedBookRow: { trueEffectiveDate: true },
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
        __args: args,
      },
    })) as unknown as {
      payReconMatchResults: {
        edges: { node: MatchResultNode }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    };

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

const flushStatusChangeLogs = async (
  client: CoreApiClient,
  logs: StatusChangeLogData[],
): Promise<void> => {
  if (logs.length === 0) return;

  await client.mutation({
    createPayReconStatusChangeLogs: {
      __args: { data: logs },
      id: true,
    },
  });
};

const flushMatchResultUpdates = async (
  client: CoreApiClient,
  updates: { id: string; writeBackStatus: string }[],
): Promise<void> => {
  for (const update of updates) {
    await client.mutation({
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

const handler = async (event: { body: RequestBody | null }) => {
  const body = event.body;

  if (!body?.sourceFileId) {
    throw new Error('Missing sourceFileId in request body');
  }

  const client = new CoreApiClient();
  const now = new Date().toISOString();

  // Fetch source file for carrier name
  const { payReconSourceFiles: sfResult } = (await client.query({
    payReconSourceFiles: {
      __args: { filter: { id: { eq: body.sourceFileId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          carrierConfig: { name: true },
        },
      },
    },
  })) as unknown as {
    payReconSourceFiles: { edges: { node: SourceFileNode }[] };
  };

  const sourceFile = sfResult.edges[0]?.node;
  const carrierName = sourceFile?.carrierConfig?.name ?? 'Unknown';
  const sourceName = sourceFile?.name ?? body.sourceFileId;

  // Update pipeline status to APPLYING
  await client.mutation({
    updatePayReconSourceFile: {
      __args: {
        id: body.sourceFileId,
        data: { parseStatus: 'APPLYING' },
      },
      id: true,
    },
  });

  // Fetch all approved match results
  const approvedResults = await fetchAllApprovedResults(
    client,
    body.sourceFileId,
  );

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
      await flushStatusChangeLogs(client, [...pendingLogs]);
      pendingLogs.length = 0;
    }

    if (pendingUpdates.length > 0) {
      await flushMatchResultUpdates(client, [...pendingUpdates]);
      pendingUpdates.length = 0;
    }
  };

  for (const result of approvedResults) {
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
          sourceFileId: body.sourceFileId,
        });

        pendingUpdates.push({ id: result.id, writeBackStatus: 'APPLIED' });
        applied++;

        console.log(
          `[apply-status-updates] Discovered policy# for ${result.crmPolicyId}: ${result.suggestedPolicyNumber}`,
        );
      } catch (error) {
        failed++;

        console.error(
          `[apply-status-updates] Failed policy# discovery for ${result.id}:`,
          error,
        );

        pendingUpdates.push({ id: result.id, writeBackStatus: 'FAILED' });
      }

      // Flush batches every BATCH_SIZE results
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
      // Update the primary policy (status + expireDate + policyNumber if discovered)
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

      // Accumulate StatusChangeLog record
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
        sourceFileId: body.sourceFileId,
      });

      // Accumulate MatchResult writeBackStatus update
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

    // Flush batches every BATCH_SIZE results
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
    const { payReconReconciliationRuns: runResult } = (await client.query({
      payReconReconciliationRuns: {
        __args: {
          filter: { sourceFileId: { eq: body.sourceFileId } },
          first: 1,
        },
        edges: { node: { id: true } },
      },
    })) as unknown as {
      payReconReconciliationRuns: { edges: { node: { id: string } }[] };
    };

    const runId = runResult.edges[0]?.node?.id;

    if (runId) {
      await client.mutation({
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
  await client.mutation({
    updatePayReconSourceFile: {
      __args: {
        id: body.sourceFileId,
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

export default defineLogicFunction({
  universalIdentifier: APPLY_STATUS_UPDATES_LOGIC_FUNCTION_ID,
  name: 'apply-status-updates',
  description:
    'Apply approved status updates from match results to CRM policies with audit trail',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/apply-status-updates',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
