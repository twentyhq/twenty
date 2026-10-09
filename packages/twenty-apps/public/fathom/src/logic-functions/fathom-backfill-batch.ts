import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import {
  FATHOM_RETRY_FALLBACK_DELAY_MILLISECONDS,
  MAX_FATHOM_BACKFILL_REQUEUE_ATTEMPTS,
} from 'src/constants/fathom.constant';
import { FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomBackfillBatchPayload } from 'src/logic-functions/types/fathom-backfill-batch-payload.type';
import { type FathomMeetingSyncResult } from 'src/logic-functions/types/fathom-meeting-sync-result.type';
import { type SerializedFathomMeeting } from 'src/logic-functions/types/serialized-fathom-meeting.type';
import { buildRetryableFathomError } from 'src/logic-functions/utils/build-retryable-fathom-error.util';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { createFathomCoreApiClient } from 'src/logic-functions/utils/create-fathom-core-api-client.util';
import { enqueueFathomBackfillBatch } from 'src/logic-functions/utils/enqueue-fathom-backfill-batch.util';
import { getFathomRequeueDelay } from 'src/logic-functions/utils/get-fathom-requeue-delay.util';
import { hydrateFathomMeeting } from 'src/logic-functions/utils/hydrate-fathom-meeting.util';
import { syncFathomMeetingsToCallRecordings } from 'src/logic-functions/utils/sync-fathom-meetings-to-call-recordings.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const fathomBackfillBatchHandler = async (
  payload: FathomBackfillBatchPayload,
) => {
  const connection = await getConnection(payload.connectedAccountId);
  const fathomClient = createFathomClient(connection.accessToken);
  const coreApiClient = createFathomCoreApiClient();
  const requeueAttempt = payload.requeueAttempt ?? 0;
  const results: FathomMeetingSyncResult[] = [];
  const hydratedMeetings: Array<{
    serializedMeeting: SerializedFathomMeeting;
    meeting: Meeting;
  }> = [];
  let skippedMeetingCount = 0;
  const countImportedMeetings = () =>
    results.filter((result) => !('skipped' in result)).length;
  let pendingHydrateRequeue:
    | { meetingIndex: number; operation: string; error: unknown; delay: number }
    | undefined;

  const requeueMeetings = async ({
    meetings,
    operation,
    error,
    delay,
  }: {
    meetings: SerializedFathomMeeting[];
    operation: string;
    error: unknown;
    delay: number;
  }) => {
    if (requeueAttempt >= MAX_FATHOM_BACKFILL_REQUEUE_ATTEMPTS) {
      throw buildRetryableFathomError({ operation, error });
    }

    try {
      await enqueueFathomBackfillBatch({
        connectedAccountId: payload.connectedAccountId,
        meetings,
        requeueAttempt: requeueAttempt + 1,
        notBeforeDelayMilliseconds: delay,
      });
    } catch (enqueueError) {
      throw buildRetryableFathomError({
        operation: `re-enqueue after ${operation}`,
        error: enqueueError,
      });
    }

    console.warn(
      `[fathom] ${operation} failed, re-enqueued ${meetings.length} meetings in ${delay}ms: ${toErrorMessage(error)}`,
    );

    return {
      success: true,
      importedMeetingCount: countImportedMeetings(),
      failedMeetingCount: skippedMeetingCount,
      requeuedMeetingCount: meetings.length,
      results,
    };
  };

  // Sequential on purpose: the batch is the unit of pacing against Fathom.
  for (const [meetingIndex, serializedMeeting] of payload.meetings.entries()) {
    const hydrateOperation = `hydrate recording ${serializedMeeting.recordingId}`;

    try {
      hydratedMeetings.push({
        serializedMeeting,
        meeting: await hydrateFathomMeeting({
          fathomClient,
          serializedMeeting,
        }),
      });
    } catch (error) {
      const delay = getFathomRequeueDelay({ error, now: new Date() });

      if (isDefined(delay)) {
        pendingHydrateRequeue = {
          meetingIndex,
          operation: hydrateOperation,
          error,
          delay,
        };

        break;
      }

      // One unreadable recording must not cost the rest of the batch.
      console.error(
        `[fathom] skipped recording ${serializedMeeting.recordingId}: ${toErrorMessage(error)}`,
      );
      skippedMeetingCount += 1;
    }
  }

  const syncedCallRecordingIds = new Set<string>();
  const unhydratedMeetings = isDefined(pendingHydrateRequeue)
    ? payload.meetings.slice(pendingHydrateRequeue.meetingIndex)
    : [];

  try {
    await syncFathomMeetingsToCallRecordings({
      coreApiClient,
      meetings: hydratedMeetings.map(({ meeting }) => meeting),
      connectedAccountId: payload.connectedAccountId,
      onMeetingSynced: (result) => {
        syncedCallRecordingIds.add(result.callRecordingId);
        results.push(result);
      },
    });
  } catch (error) {
    const operation = `sync recordings ${hydratedMeetings
      .map(({ serializedMeeting }) => serializedMeeting.recordingId)
      .join(', ')}`;

    if (!(error instanceof RetryableLogicFunctionError)) {
      throw buildRetryableFathomError({ operation, error });
    }

    return requeueMeetings({
      meetings: [
        ...hydratedMeetings
          .filter(
            ({ serializedMeeting }) =>
              !syncedCallRecordingIds.has(
                computeCallRecordingIdForFathomMeeting(
                  serializedMeeting.recordingId,
                ),
              ),
          )
          .map(({ serializedMeeting }) => serializedMeeting),
        ...unhydratedMeetings,
      ],
      operation,
      error,
      delay: Math.max(
        FATHOM_RETRY_FALLBACK_DELAY_MILLISECONDS,
        pendingHydrateRequeue?.delay ?? 0,
      ),
    });
  }

  if (isDefined(pendingHydrateRequeue)) {
    return requeueMeetings({
      meetings: unhydratedMeetings,
      operation: pendingHydrateRequeue.operation,
      error: pendingHydrateRequeue.error,
      delay: pendingHydrateRequeue.delay,
    });
  }

  return {
    success: true,
    importedMeetingCount: countImportedMeetings(),
    failedMeetingCount: skippedMeetingCount,
    requeuedMeetingCount: 0,
    results,
  };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
  name: 'fathom-backfill-batch',
  description:
    'Fetches the transcript and summary of one paced batch of Fathom meetings and upserts their CallRecordings.',
  timeoutSeconds: 300,
  handler: fathomBackfillBatchHandler,
});
