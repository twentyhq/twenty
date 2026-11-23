import { type EnqueueJobItem } from 'twenty-sdk/logic-function';

import { computeCallRecordingIdForGoogleMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-google-meet-conference.util';

export const buildGoogleMeetCallSummaryJob = ({
  conferenceRecordName,
  userWorkspaceId,
}: {
  conferenceRecordName: string;
  userWorkspaceId: string | null;
}): EnqueueJobItem => {
  const callRecordingId =
    computeCallRecordingIdForGoogleMeetConference(conferenceRecordName);

  return {
    jobId: `google-meet-summary-${callRecordingId}`,
    payload: { callRecordingId, userWorkspaceId },
  };
};
