import { type EnqueueJobItem } from 'twenty-sdk/logic-function';

import { computeCallRecordingIdForMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-meet-conference.util';

export const buildMeetCallSummaryJob = ({
  conferenceRecordName,
  userWorkspaceId,
}: {
  conferenceRecordName: string;
  userWorkspaceId: string | null;
}): EnqueueJobItem => {
  const callRecordingId =
    computeCallRecordingIdForMeetConference(conferenceRecordName);

  return {
    jobId: `google-meet-summary-${callRecordingId}`,
    payload: { callRecordingId, userWorkspaceId },
  };
};
