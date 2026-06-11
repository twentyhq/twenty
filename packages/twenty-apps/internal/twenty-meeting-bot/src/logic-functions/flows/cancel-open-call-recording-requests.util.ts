import { CoreApiClient } from 'twenty-client-sdk/core';

import { cancelCallRecordingRequest } from 'src/logic-functions/flows/cancel-call-recording-request.util';
import { findOpenScheduledCallRecordings } from 'src/logic-functions/data/find-open-scheduled-call-recordings.util';

export type CancelOpenCallRecordingRequestsResult = {
  canceledCallRecordingIds: string[];
};

// Flipping the enabled kill-switch emits no database event, so it converges here.
export const cancelOpenCallRecordingRequests = async ({
  client,
}: {
  client: CoreApiClient;
}): Promise<CancelOpenCallRecordingRequestsResult> => {
  const openCallRecordings = await findOpenScheduledCallRecordings(client);
  const canceledCallRecordingIds: string[] = [];

  for (const callRecording of openCallRecordings) {
    await cancelCallRecordingRequest({ client, callRecording });
    canceledCallRecordingIds.push(callRecording.id);
  }

  return { canceledCallRecordingIds };
};
