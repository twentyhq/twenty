import { describe, expect, it } from 'vitest';

import { buildMeetCallSummaryJob } from 'src/logic-functions/utils/build-meet-call-summary-job.util';
import { computeCallRecordingIdForMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-meet-conference.util';

describe('buildMeetCallSummaryJob', () => {
  it('should build one summary job per call recording for its owner', () => {
    const callRecordingId = computeCallRecordingIdForMeetConference(
      'conferenceRecords/first',
    );

    expect(
      buildMeetCallSummaryJob({
        conferenceRecordName: 'conferenceRecords/first',
        userWorkspaceId: 'owner-user-workspace-id',
      }),
    ).toEqual({
      jobId: `google-meet-summary-${callRecordingId}`,
      payload: { callRecordingId, userWorkspaceId: 'owner-user-workspace-id' },
    });
  });
});
