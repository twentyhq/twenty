import { type CoreApiClient } from 'twenty-client-sdk/core';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import {
  type BackfillPhase,
  BACKFILL_PHASE_ORDER,
} from 'src/constants/backfill';
import { backfillPeopleLastContact } from 'src/utils/backfill-people-last-contact';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import { recomputeCompaniesLastContact } from 'src/utils/recompute-company-last-contact';
import { recomputeOpportunitiesLastContact } from 'src/utils/recompute-opportunity-last-contact';

// A total order over createdAt then id keeps the cursor stable while the
// backfill runs, including across runs: records created meanwhile sort to the
// tail.
const BACKFILL_ORDER_BY = [
  { createdAt: 'AscNullsFirst' },
  { id: 'AscNullsFirst' },
];

// People are aggregated from their emails and meetings. Opportunities and
// companies come after them and only mirror the people's stored last contact,
// which is far cheaper than aggregating the same interactions again.
const BACKFILL_BATCH_HANDLERS: Record<
  BackfillPhase,
  (client: CoreApiClient, recordIds: string[]) => Promise<void>
> = {
  people: backfillPeopleLastContact,
  opportunities: recomputeOpportunitiesLastContact,
  companies: recomputeCompaniesLastContact,
};

export type BackfillPhaseResult = { phase: BackfillPhase; count: number };

export type BackfillCursor = { phase: BackfillPhase; after?: string };

export type BackfillPauseReason = 'deadline' | 'rate-limited';

export type BackfillRunResult = {
  phases: BackfillPhaseResult[];
  pause?: { reason: BackfillPauseReason; resumeFrom: BackfillCursor };
};

type PhaseRunResult = {
  count: number;
  pause?: { reason: BackfillPauseReason; after?: string };
};

const backfillPhaseInBatches = async ({
  client,
  phase,
  batchSize,
  after: startAfter,
  deadlineMs,
}: {
  client: CoreApiClient;
  phase: BackfillPhase;
  batchSize: number;
  after?: string;
  deadlineMs: number;
}): Promise<PhaseRunResult> => {
  let count = 0;
  let after = startAfter;

  do {
    if (Date.now() >= deadlineMs) {
      return { count, pause: { reason: 'deadline', after } };
    }

    try {
      const result = await executeWithRetry(() =>
        client.query({
          [phase]: {
            __args: { first: batchSize, after, orderBy: BACKFILL_ORDER_BY },
            edges: { node: { id: true } },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );
      const connection = result?.[phase];
      const recordIds: string[] = (connection?.edges ?? []).map(
        (edge: { node: { id: string } }) => edge.node.id,
      );

      if (recordIds.length > 0) {
        await BACKFILL_BATCH_HANDLERS[phase](client, recordIds);
        count += recordIds.length;
      }

      after = connection?.pageInfo.hasNextPage
        ? (connection.pageInfo.endCursor ?? undefined)
        : undefined;
    } catch (error) {
      // Every batch write is idempotent, so the interrupted batch is simply
      // redone when the backfill resumes.
      if (error instanceof RetryableLogicFunctionError) {
        return { count, pause: { reason: 'rate-limited', after } };
      }

      throw error;
    }
  } while (after);

  return { count };
};

// Batches run one after the other so the backfill's API calls stay sequential
// instead of competing with each other for the same rate limit.
export const runLastContactBackfill = async (
  client: CoreApiClient,
  {
    resumeFrom,
    deadlineMs,
  }: { resumeFrom?: BackfillCursor; deadlineMs: number },
): Promise<BackfillRunResult> => {
  const batchSize = getBackfillBatchSize();
  const firstPhaseIndex = resumeFrom
    ? Math.max(BACKFILL_PHASE_ORDER.indexOf(resumeFrom.phase), 0)
    : 0;
  const phases: BackfillPhaseResult[] = [];

  for (const [index, phase] of BACKFILL_PHASE_ORDER.slice(
    firstPhaseIndex,
  ).entries()) {
    const { count, pause } = await backfillPhaseInBatches({
      client,
      phase,
      batchSize,
      after: index === 0 ? resumeFrom?.after : undefined,
      deadlineMs,
    });

    console.log(`Backfilled last contact on ${count} ${phase}`);
    phases.push({ phase, count });

    if (pause) {
      return {
        phases,
        pause: {
          reason: pause.reason,
          resumeFrom: { phase, after: pause.after },
        },
      };
    }
  }

  return { phases };
};
