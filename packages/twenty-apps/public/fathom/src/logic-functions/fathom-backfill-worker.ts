import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJob, getConnection, kv } from 'twenty-sdk/logic-function';

import { FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER } from 'src/constants/fathom-backfill-batch-universal-identifier';
import { FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/fathom-backfill-worker-universal-identifier';
import { chunkIntoBatches } from 'src/logic-functions/utils/chunk-into-batches.util';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { listAccessibleFathomMeetingPage } from 'src/logic-functions/utils/list-accessible-fathom-meeting-page.util';
import { serializeFathomMeeting } from 'src/logic-functions/utils/serialize-fathom-meeting.util';

const BACKFILL_BATCH_SIZE = 5;
const BACKFILL_BATCH_STAGGER_MILLISECONDS = 20_000;

type FathomBackfillWorkerPayload = {
  connectedAccountId: string;
  days?: number;
  createdAfter?: string;
  cursor?: string;
};

type FathomBackfillSchedule = {
  nextBatchAvailableAt: number;
};

const getBackfillScheduleKey = (connectedAccountId: string): string =>
  `fathom-backfill-schedule:${connectedAccountId}`;

const reserveBackfillBatchSchedule = async ({
  connectedAccountId,
  batchCount,
}: {
  connectedAccountId: string;
  batchCount: number;
}): Promise<{ batchDelays: number[]; continuationDelay: number }> => {
  const now = Date.now();
  const scheduleKey = getBackfillScheduleKey(connectedAccountId);
  const existingSchedule = await kv.get<FathomBackfillSchedule>(scheduleKey);
  const scheduleStart = Math.max(
    now,
    existingSchedule?.nextBatchAvailableAt ?? now,
  );
  const batchDelays = Array.from(
    { length: batchCount },
    (_, batchIndex) =>
      scheduleStart - now +
      batchIndex * BACKFILL_BATCH_STAGGER_MILLISECONDS,
  );
  const nextBatchAvailableAt =
    scheduleStart + batchCount * BACKFILL_BATCH_STAGGER_MILLISECONDS;

  if (batchCount > 0) {
    await kv.set(scheduleKey, { nextBatchAvailableAt });
  }

  return {
    batchDelays,
    continuationDelay: Math.max(0, nextBatchAvailableAt - now),
  };
};

const getCreatedAfter = (payload: FathomBackfillWorkerPayload): string => {
  if (isNonEmptyString(payload.createdAfter)) {
    return payload.createdAfter;
  }

  if (Number.isInteger(payload.days) && payload.days !== undefined) {
    return new Date(
      Date.now() - payload.days * 24 * 60 * 60 * 1000,
    ).toISOString();
  }

  throw new Error('Fathom backfill worker requires a history window');
};

export const fathomBackfillWorkerHandler = async (
  payload: FathomBackfillWorkerPayload,
) => {
  const connection = await getConnection(payload.connectedAccountId);
  const createdAfter = getCreatedAfter(payload);
  const meetingPage = await listAccessibleFathomMeetingPage({
    fathomClient: createFathomClient(connection.accessToken),
    createdAfter,
    cursor: payload.cursor,
  });
  const batches = chunkIntoBatches(
    meetingPage.meetings.map(serializeFathomMeeting),
    BACKFILL_BATCH_SIZE,
  );
  const { batchDelays, continuationDelay } =
    await reserveBackfillBatchSchedule({
      connectedAccountId: payload.connectedAccountId,
      batchCount: batches.length,
    });

  for (const [batchIndex, meetingBatch] of batches.entries()) {
    await enqueueJob({
      logicFunctionUniversalIdentifier:
        FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
      payload: {
        connectedAccountId: payload.connectedAccountId,
        meetings: meetingBatch,
      },
      retryLimit: 3,
      delayMs: batchDelays[batchIndex],
    });
  }

  if (isNonEmptyString(meetingPage.nextCursor)) {
    await enqueueJob({
      logicFunctionUniversalIdentifier:
        FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
      payload: {
        connectedAccountId: payload.connectedAccountId,
        createdAfter,
        cursor: meetingPage.nextCursor,
      },
      retryLimit: 3,
      delayMs: continuationDelay,
    });
  }

  return {
    success: true,
    discoveredMeetingCount: meetingPage.meetings.length,
    enqueuedBatchCount: batches.length,
    hasMoreMeetings: isNonEmptyString(meetingPage.nextCursor),
  };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
  name: 'fathom-backfill-worker',
  description:
    'Discovers one page of Fathom meetings, schedules paced import batches, and continues from Fathom\'s cursor.',
  timeoutSeconds: 60,
  handler: fathomBackfillWorkerHandler,
});
