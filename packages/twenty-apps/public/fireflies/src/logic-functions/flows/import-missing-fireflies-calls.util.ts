import { type CoreApiClient } from 'twenty-client-sdk/core';

import { sleepForMilliseconds } from 'src/utils/sleep-for-milliseconds.util';

import { findCallRecordingFieldStatesOrThrow } from 'src/logic-functions/data/find-call-recording-field-states-or-throw.util';
import { syncFirefliesTranscriptBatch } from 'src/logic-functions/flows/sync-fireflies-transcript-batch.util';
import { type ImportMissingFirefliesCallsResult } from 'src/logic-functions/types/import-missing-fireflies-calls-result.type';
import { computeCallRecordingIdForFirefliesMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fireflies-meeting';

type ImportMissingFirefliesCallsParams = {
  apiKey: string;
  coreApiClient: CoreApiClient;
  transcriptIds: string[];
  sleep?: (milliseconds: number) => Promise<void>;
};

export const importMissingFirefliesCalls = async ({
  apiKey,
  coreApiClient,
  transcriptIds,
  sleep = sleepForMilliseconds,
}: ImportMissingFirefliesCallsParams): Promise<ImportMissingFirefliesCallsResult> => {
  const callRecordingFieldStates = await findCallRecordingFieldStatesOrThrow({
    coreApiClient,
    callRecordingIds: transcriptIds.map(
      computeCallRecordingIdForFirefliesMeeting,
    ),
  });

  return syncFirefliesTranscriptBatch({
    apiKey,
    coreApiClient,
    transcriptIds,
    callRecordingFieldStates,
    sleep,
  });
};
