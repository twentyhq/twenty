import { describe, expect, it } from 'vitest';

import { computeCallRecordingIdForMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-meet-conference.util';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('computeCallRecordingIdForMeetConference', () => {
  it('should give the same UUID v4 for the same conference', () => {
    const callRecordingId = computeCallRecordingIdForMeetConference(
      'conferenceRecords/first',
    );

    expect(callRecordingId).toMatch(UUID_V4_PATTERN);
    expect(
      computeCallRecordingIdForMeetConference('conferenceRecords/first'),
    ).toBe(callRecordingId);
  });

  it('should give different identifiers to different conferences', () => {
    expect(
      computeCallRecordingIdForMeetConference('conferenceRecords/first'),
    ).not.toBe(
      computeCallRecordingIdForMeetConference('conferenceRecords/second'),
    );
  });
});
