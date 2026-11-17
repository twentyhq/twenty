import { describe, expect, it } from 'vitest';

import { buildGoogleMeetCallSummaryJob } from 'src/logic-functions/utils/build-google-meet-call-summary-job.util';
import { computeCallRecordingIdForGoogleMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-google-meet-conference.util';

describe('buildGoogleMeetCallSummaryJob', () => {
  it('should build one summary job per call recording for its owner', () => {
    const callRecordingId = computeCallRecordingIdForGoogleMeetConference(
      'conferenceRecords/first',
    );

    expect(
      buildGoogleMeetCallSummaryJob({
        conferenceRecordName: 'conferenceRecords/first',
        userWorkspaceId: 'owner-user-workspace-id',
      }),
    ).toEqual({
      jobId: `google-meet-summary-${callRecordingId}`,
      payload: { callRecordingId, userWorkspaceId: 'owner-user-workspace-id' },
    });
  });
});
