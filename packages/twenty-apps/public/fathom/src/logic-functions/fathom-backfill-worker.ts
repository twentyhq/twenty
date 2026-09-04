import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import {
  FATHOM_BACKFILL_BATCH_SIZE,
  MAX_FATHOM_BACKFILL_PAGES,
  MILLISECONDS_PER_DAY,
} from 'src/constants/fathom.constant';
import {
  FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
  FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type FathomBackfillWorkerPayload } from 'src/logic-functions/types/fathom-backfill-worker-payload.type';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { excludeDeletedFathomMeetings } from 'src/logic-functions/utils/exclude-deleted-fathom-meetings.util';
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

  const createdAfter = getCreatedAfter(payload, Date.now());
  const pageIndex = payload.pageIndex ?? 0;
  const connection = await getConnection(payload.connectedAccountId);
  const meetingPage = await listFathomMeetingPage({
    fathomClient: createFathomClient(connection.accessToken),
    createdAfter,
    cursor: payload.cursor,
  });
  const serializedMeetings = meetingPage.meetings.map(serializeFathomMeeting);
  const importableMeetings = await excludeDeletedFathomMeetings({
    coreApiClient: new CoreApiClient({ runAs: 'application' }),
    meetings: serializedMeetings,
  });
  const meetingBatches = chunkIntoBatches(
    importableMeetings,
    FATHOM_BACKFILL_BATCH_SIZE,
  );
  const { batchDelays, continuationDelay } =
    await reserveFathomBackfillBatchSlots({
      connectedAccountId: payload.connectedAccountId,
      batchCount: meetingBatches.length,
    });

  for (const [batchIndex, meetings] of meetingBatches.entries()) {
    await enqueueFathomJobOrThrow({
      logicFunctionUniversalIdentifier:
        FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
      payload: { connectedAccountId: payload.connectedAccountId, meetings },
      delayMs: batchDelays[batchIndex],
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
    await enqueueFathomJobOrThrow({
      logicFunctionUniversalIdentifier:
        FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
      payload: {
        connectedAccountId: payload.connectedAccountId,
        createdAfter,
        cursor: meetingPage.nextCursor,
        pageIndex: pageIndex + 1,
      },
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
  timeoutSeconds: 120,
  handler: fathomBackfillWorkerHandler,
});
