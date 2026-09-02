import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';

import {
  FATHOM_BACKFILL_BATCH_SIZE,
  MILLISECONDS_PER_DAY,
} from 'src/constants/fathom.constant';
import {
  FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
  FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type FathomBackfillWorkerPayload } from 'src/logic-functions/types/fathom-backfill-worker-payload.type';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { enqueueFathomJobOrThrow } from 'src/logic-functions/utils/enqueue-fathom-job-or-throw.util';
import { listFathomMeetingPage } from 'src/logic-functions/utils/list-fathom-meeting-page.util';
import { reserveFathomBackfillBatchSlots } from 'src/logic-functions/utils/reserve-fathom-backfill-batch-slots.util';
import { serializeFathomMeeting } from 'src/logic-functions/utils/serialize-fathom-meeting.util';
import { chunkIntoBatches } from 'src/utils/chunk-into-batches.util';

const getCreatedAfter = (
  payload: FathomBackfillWorkerPayload,
  now: number,
): string => {
  if (isNonEmptyString(payload.createdAfter)) {
    return payload.createdAfter;
  }

  if (Number.isInteger(payload.days) && payload.days !== undefined) {
    return new Date(now - payload.days * MILLISECONDS_PER_DAY).toISOString();
  }

  throw new Error('Fathom backfill worker requires a days window');
};

export const fathomBackfillWorkerHandler = async (
  payload: FathomBackfillWorkerPayload,
) => {
  if (!isNonEmptyString(payload.connectedAccountId)) {
    throw new Error('Fathom backfill worker requires a connectedAccountId');
  }

  const now = Date.now();
  const createdAfter = getCreatedAfter(payload, now);
  const connection = await getConnection(payload.connectedAccountId);
  const meetingPage = await listFathomMeetingPage({
    fathomClient: createFathomClient(connection.accessToken),
    createdAfter,
    cursor: payload.cursor,
  });
  const meetingBatches = chunkIntoBatches(
    meetingPage.meetings.map(serializeFathomMeeting),
    FATHOM_BACKFILL_BATCH_SIZE,
  );
  const { batchDelays, continuationDelay } =
    await reserveFathomBackfillBatchSlots({
      connectedAccountId: payload.connectedAccountId,
      batchCount: meetingBatches.length,
      now,
    });

  for (const [batchIndex, meetings] of meetingBatches.entries()) {
    await enqueueFathomJobOrThrow({
      logicFunctionUniversalIdentifier:
        FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
      payload: { connectedAccountId: payload.connectedAccountId, meetings },
      delayMs: batchDelays[batchIndex],
    });
  }

  const hasMoreMeetings = isNonEmptyString(meetingPage.nextCursor);

  if (hasMoreMeetings) {
    await enqueueFathomJobOrThrow({
      logicFunctionUniversalIdentifier:
        FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
      payload: {
        connectedAccountId: payload.connectedAccountId,
        createdAfter,
        cursor: meetingPage.nextCursor,
      },
      delayMs: continuationDelay,
    });
  }

  return {
    success: true,
    createdAfter,
    discoveredMeetingCount: meetingPage.meetings.length,
    enqueuedBatchCount: meetingBatches.length,
    hasMoreMeetings,
  };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
  name: 'fathom-backfill-worker',
  description:
    "Discovers one page of Fathom meetings, schedules paced import batches, and continues from Fathom's cursor.",
  timeoutSeconds: 60,
  handler: fathomBackfillWorkerHandler,
});
