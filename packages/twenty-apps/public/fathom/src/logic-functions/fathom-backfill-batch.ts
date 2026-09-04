import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import { FATHOM_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type SerializedFathomMeeting } from 'src/logic-functions/types/serialized-fathom-meeting.type';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { hydrateFathomMeeting } from 'src/logic-functions/utils/hydrate-fathom-meeting.util';
import { isTransientFathomError } from 'src/logic-functions/utils/is-transient-fathom-error.util';
import { syncFathomMeetingToCallRecording } from 'src/logic-functions/utils/sync-fathom-meeting-to-call-recording.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const fathomBackfillBatchHandler = async (payload: {
  connectedAccountId: string;
  meetings: SerializedFathomMeeting[];
}) => {
  const connection = await getConnection(payload.connectedAccountId);
  const fathomClient = createFathomClient(connection.accessToken);
  const coreApiClient = new CoreApiClient({ runAs: 'application' });
  const results = [];

  // Sequential on purpose: the batch is the unit of pacing against Fathom.
  for (const serializedMeeting of payload.meetings) {
    const meeting = await hydrateFathomMeeting({
      fathomClient,
      serializedMeeting,
    }).catch((error: unknown) => {
      // Only a RetryableLogicFunctionError makes the platform retry, so a rate
      // limit or a Fathom outage is rethrown as one.
      if (isTransientFathomError(error)) {
        throw new RetryableLogicFunctionError(toErrorMessage(error));
      }

      // One unreadable recording must not cost the rest of the batch.
      console.error(
        `[fathom] skipped recording ${serializedMeeting.recordingId}: ${toErrorMessage(error)}`,
      );

      return undefined;
    });

    if (!isDefined(meeting)) {
      continue;
    }

    // A failed upsert retries the whole batch. The replay re-fetches the
    // meetings already imported, which costs calls but cannot duplicate
    // records: the CallRecording id is derived from the recording.
    results.push(
      await syncFathomMeetingToCallRecording({
        coreApiClient,
        meeting,
        connectedAccountId: payload.connectedAccountId,
      }).catch(
        (error: unknown) => {
          throw new RetryableLogicFunctionError(toErrorMessage(error));
        },
      ),
    );
  }

  return {
    success: true,
    importedMeetingCount: results.length,
    failedMeetingCount: payload.meetings.length - results.length,
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
