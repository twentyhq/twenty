import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import {
  FATHOM_BACKFILL_BATCH_SIZE,
  MAX_FATHOM_BACKFILL_PAGES,
  MAX_FATHOM_BACKFILL_REQUEUE_ATTEMPTS,
  MILLISECONDS_PER_DAY,
} from 'src/constants/fathom.constant';
import {
  FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
  FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type FathomBackfillWorkerPayload } from 'src/logic-functions/types/fathom-backfill-worker-payload.type';
import { buildRetryableFathomError } from 'src/logic-functions/utils/build-retryable-fathom-error.util';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { createFathomCoreApiClient } from 'src/logic-functions/utils/create-fathom-core-api-client.util';
import { excludeDeletedFathomMeetings } from 'src/logic-functions/utils/exclude-deleted-fathom-meetings.util';
import { enqueueFathomJobsOrThrow } from 'src/logic-functions/utils/enqueue-fathom-jobs-or-throw.util';
import { getFathomRequeueDelay } from 'src/logic-functions/utils/get-fathom-requeue-delay.util';
import { listFathomMeetingPage } from 'src/logic-functions/utils/list-fathom-meeting-page.util';
import { reserveFathomImportSlots } from 'src/logic-functions/utils/reserve-fathom-import-slots.util';
import { serializeFathomMeeting } from 'src/logic-functions/utils/serialize-fathom-meeting.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';
import { chunkIntoBatches } from 'src/utils/chunk-into-batches.util';

const getCreatedAfter = ({
  payload,
  now,
}: {
  payload: FathomBackfillWorkerPayload;
  now: number;
}): string => {
  if (isNonEmptyString(payload.createdAfter)) {
    return payload.createdAfter;
  }

  if (isDefined(payload.days) && Number.isInteger(payload.days)) {
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

  const createdAfter = getCreatedAfter({ payload, now: Date.now() });
  const pageIndex = payload.pageIndex ?? 0;
  const connection = await getConnection(payload.connectedAccountId);
  const requeueAttempt = payload.requeueAttempt ?? 0;
  const listOperation = `list meetings for connected account ${payload.connectedAccountId}`;
  let meetingPage: Awaited<ReturnType<typeof listFathomMeetingPage>>;

  try {
    meetingPage = await listFathomMeetingPage({
      fathomClient: createFathomClient(connection.accessToken),
      createdAfter,
      cursor: payload.cursor,
    });
  } catch (error) {
    const delay = getFathomRequeueDelay({ error, now: new Date() });

    if (!isDefined(delay)) {
      throw error;
    }

    // A lost page would end the history import for good, so once the
    // re-enqueue budget is spent the platform's own retries get a last try.
    if (requeueAttempt >= MAX_FATHOM_BACKFILL_REQUEUE_ATTEMPTS) {
      throw buildRetryableFathomError({ operation: listOperation, error });
    }

    await enqueueFathomJobsOrThrow({
      logicFunctionUniversalIdentifier:
        FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
      payloads: [
        {
          connectedAccountId: payload.connectedAccountId,
          createdAfter,
          cursor: payload.cursor,
          pageIndex,
          requeueAttempt: requeueAttempt + 1,
        },
      ],
      delayMs: delay,
    });

    console.warn(
      `[fathom] ${listOperation} failed, re-enqueued in ${delay}ms: ${toErrorMessage(error)}`,
    );

    return { success: true, createdAfter, requeueDelay: delay };
  }

  const serializedMeetings = meetingPage.meetings.map(serializeFathomMeeting);
  const importableMeetings = await excludeDeletedFathomMeetings({
    coreApiClient: createFathomCoreApiClient(),
    meetings: serializedMeetings,
  });
  const meetingBatches = chunkIntoBatches(
    importableMeetings,
    FATHOM_BACKFILL_BATCH_SIZE,
  );
  const { slotDelays, continuationDelay } = await reserveFathomImportSlots({
    connectedAccountId: payload.connectedAccountId,
    slotCount: meetingBatches.length,
  });

  for (const [batchIndex, meetings] of meetingBatches.entries()) {
    await enqueueFathomJobsOrThrow({
      logicFunctionUniversalIdentifier:
        FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
      payloads: [{ connectedAccountId: payload.connectedAccountId, meetings }],
      delayMs: slotDelays[batchIndex],
    });
  }

  // A cursor that repeats or cycles would chain this worker forever; the page
  // bound is far above any real history and only exists to end such a chain.
  const hasMoreMeetings =
    isNonEmptyString(meetingPage.nextCursor) &&
    meetingPage.nextCursor !== payload.cursor;
  const isPageBoundReached = pageIndex + 1 >= MAX_FATHOM_BACKFILL_PAGES;

  if (hasMoreMeetings && isPageBoundReached) {
    console.error(
      `[fathom] backfill for connected account ${payload.connectedAccountId} stopped after ${MAX_FATHOM_BACKFILL_PAGES} pages with cursor ${meetingPage.nextCursor} still pending`,
    );
  }

  if (hasMoreMeetings && !isPageBoundReached) {
    await enqueueFathomJobsOrThrow({
      logicFunctionUniversalIdentifier:
        FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
      payloads: [
        {
          connectedAccountId: payload.connectedAccountId,
          createdAfter,
          cursor: meetingPage.nextCursor,
          pageIndex: pageIndex + 1,
        },
      ],
      delayMs: continuationDelay,
    });
  }

  return {
    success: true,
    createdAfter,
    discoveredMeetingCount: meetingPage.meetings.length,
    skippedDeletedMeetingCount:
      serializedMeetings.length - importableMeetings.length,
    enqueuedBatchCount: meetingBatches.length,
    hasMoreMeetings: hasMoreMeetings && !isPageBoundReached,
  };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
  name: 'fathom-backfill-worker',
  description:
    "Discovers one page of Fathom meetings, schedules paced import batches, and continues from Fathom's cursor.",
  // A timeout is never retried and would end the history import, so this
  // outlasts the two-minute Twenty rate-limit wait plus the Fathom page fetch.
  timeoutSeconds: 300,
  handler: fathomBackfillWorkerHandler,
});
