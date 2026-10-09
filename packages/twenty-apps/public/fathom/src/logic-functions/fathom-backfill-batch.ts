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
import { buildRetryableFathomError } from 'src/logic-functions/utils/build-retryable-fathom-error.util';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { createFathomCoreApiClient } from 'src/logic-functions/utils/create-fathom-core-api-client.util';
import { enqueueFathomBackfillBatch } from 'src/logic-functions/utils/enqueue-fathom-backfill-batch.util';
import { getFathomRequeueDelay } from 'src/logic-functions/utils/get-fathom-requeue-delay.util';
import { hydrateFathomMeeting } from 'src/logic-functions/utils/hydrate-fathom-meeting.util';
import { syncFathomMeetingToCallRecording } from 'src/logic-functions/utils/sync-fathom-meeting-to-call-recording.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const fathomBackfillBatchHandler = async (
  payload: FathomBackfillBatchPayload,
) => {
  const connection = await getConnection(payload.connectedAccountId);
  const fathomClient = createFathomClient(connection.accessToken);
  const coreApiClient = createFathomCoreApiClient();
  const requeueAttempt = payload.requeueAttempt ?? 0;
  const results: FathomMeetingSyncResult[] = [];
  let skippedMeetingCount = 0;
  const countImportedMeetings = () =>
    results.filter((result) => !('skipped' in result)).length;

  const requeueRemainingMeetings = async ({
    meetingIndex,
    operation,
    error,
    delay,
  }: {
    meetingIndex: number;
    operation: string;
    error: unknown;
    delay: number;
  }) => {
    if (requeueAttempt >= MAX_FATHOM_BACKFILL_REQUEUE_ATTEMPTS) {
      throw buildRetryableFathomError({ operation, error });
    }

    const remainingMeetings = payload.meetings.slice(meetingIndex);

    try {
      await enqueueFathomBackfillBatch({
        connectedAccountId: payload.connectedAccountId,
        meetings: remainingMeetings,
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
      `[fathom] ${operation} failed, re-enqueued ${remainingMeetings.length} meetings in ${delay}ms: ${toErrorMessage(error)}`,
    );

    return {
      success: true,
      importedMeetingCount: countImportedMeetings(),
      failedMeetingCount: skippedMeetingCount,
      requeuedMeetingCount: remainingMeetings.length,
      results,
    };
  };

  // Sequential on purpose: the batch is the unit of pacing against Fathom.
  for (const [meetingIndex, serializedMeeting] of payload.meetings.entries()) {
    const hydrateOperation = `hydrate recording ${serializedMeeting.recordingId}`;
    let meeting: Meeting;

    try {
      meeting = await hydrateFathomMeeting({ fathomClient, serializedMeeting });
    } catch (error) {
      const delay = getFathomRequeueDelay({ error, now: new Date() });

      if (isDefined(delay)) {
        return requeueRemainingMeetings({
          meetingIndex,
          operation: hydrateOperation,
          error,
          delay,
        });
      }

      // One unreadable recording must not cost the rest of the batch.
      console.error(
        `[fathom] skipped recording ${serializedMeeting.recordingId}: ${toErrorMessage(error)}`,
      );
      skippedMeetingCount += 1;

      continue;
    }

    try {
      results.push(
        await syncFathomMeetingToCallRecording({
          coreApiClient,
          meeting,
          connectedAccountId: payload.connectedAccountId,
        }),
      );
    } catch (error) {
      const operation = `sync recording ${serializedMeeting.recordingId}`;

      if (!(error instanceof RetryableLogicFunctionError)) {
        throw buildRetryableFathomError({ operation, error });
      }

      return requeueRemainingMeetings({
        meetingIndex,
        operation,
        error,
        delay: FATHOM_RETRY_FALLBACK_DELAY_MILLISECONDS,
      });
    }
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
