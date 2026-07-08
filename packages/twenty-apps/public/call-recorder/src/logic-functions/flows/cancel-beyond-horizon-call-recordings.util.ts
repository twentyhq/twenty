import { type CoreApiClient } from 'twenty-client-sdk/core';

import { cancelCallRecordingRequest } from 'src/logic-functions/flows/cancel-call-recording-request.util';
import { findScheduledCallRecordingsBeyondHorizon } from 'src/logic-functions/data/find-scheduled-call-recordings-beyond-horizon.util';

export type CancelBeyondHorizonCallRecordingsResult = {
  candidateCount: number;
  canceledCallRecordingIds: string[];
};

// Bots scheduled far in the future carry config that goes stale before the meeting.
// Cancelling them here lets the daily sweep re-create a fresh bot in the horizon.
export const cancelBeyondHorizonCallRecordings = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<CancelBeyondHorizonCallRecordingsResult> => {
  const callRecordings = await findScheduledCallRecordingsBeyondHorizon(
    client,
    now,
  );
  const canceledCallRecordingIds: string[] = [];

  for (const callRecording of callRecordings) {
    try {
      await cancelCallRecordingRequest({ client, callRecording });
      canceledCallRecordingIds.push(callRecording.id);
    } catch (error) {
      // One failure must not strand the rest; the next daily run retries this recording.
      if (process.env.NODE_ENV !== 'test') {
        console.error(
          `[call-recorder] failed to cancel beyond-horizon call recording ${callRecording.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  return {
    candidateCount: callRecordings.length,
    canceledCallRecordingIds,
  };
};
