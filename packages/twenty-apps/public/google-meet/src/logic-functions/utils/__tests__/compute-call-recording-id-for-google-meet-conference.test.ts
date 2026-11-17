import { describe, expect, it } from 'vitest';

import { computeCallRecordingIdForGoogleMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-google-meet-conference.util';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('computeCallRecordingIdForGoogleMeetConference', () => {
  it('should give the same UUID v4 for the same conference', () => {
    const callRecordingId = computeCallRecordingIdForGoogleMeetConference(
      'conferenceRecords/first',
    );

    expect(callRecordingId).toMatch(UUID_V4_PATTERN);
    expect(
      computeCallRecordingIdForGoogleMeetConference('conferenceRecords/first'),
    ).toBe(callRecordingId);
  });

  it('should give different identifiers to different conferences', () => {
    expect(
      computeCallRecordingIdForGoogleMeetConference('conferenceRecords/first'),
    ).not.toBe(
      computeCallRecordingIdForGoogleMeetConference('conferenceRecords/second'),
    );
  });
});
