import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

type CallRecordingIdNode = {
  id: string;
};

export const cancelOpenScheduledCallRecordingRequests = async (
  client: CoreApiClient,
): Promise<string[]> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          recordingRequestStatus: { eq: CallRecordingRequestStatus.REQUESTED },
          status: { eq: CallRecordingStatus.SCHEDULED },
        },
        data: { recordingRequestStatus: CallRecordingRequestStatus.CANCELED },
      },
      id: true,
    },
  });

  return (
    (result.updateCallRecordings as CallRecordingIdNode[] | undefined) ?? []
  ).map((callRecording) => callRecording.id);
};
