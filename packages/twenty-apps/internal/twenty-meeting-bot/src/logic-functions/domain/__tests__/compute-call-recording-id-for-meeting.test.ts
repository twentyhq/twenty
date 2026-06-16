import { describe, expect, it } from 'vitest';

import { computeCallRecordingIdForMeeting } from 'src/logic-functions/domain/compute-call-recording-id-for-meeting.util';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('computeCallRecordingIdForMeeting', () => {
  it('returns the same id for the same real meeting key', () => {
    const realMeetingKey =
      'link:meet.example.com/sync:2026-01-01T13:00:00.000Z';

    expect(computeCallRecordingIdForMeeting(realMeetingKey)).toBe(
      computeCallRecordingIdForMeeting(realMeetingKey),
    );
  });

  it('returns different ids for different real meeting keys', () => {
    expect(
      computeCallRecordingIdForMeeting(
        'link:meet.example.com/sync:2026-01-01T13:00:00.000Z',
      ),
    ).not.toBe(
      computeCallRecordingIdForMeeting(
        'link:meet.example.com/sync:2026-01-02T13:00:00.000Z',
      ),
    );
  });

  it('returns a v4-shaped uuid', () => {
    expect(
      computeCallRecordingIdForMeeting(
        'ical:some-uid:2026-01-01T13:00:00.000Z',
      ),
    ).toMatch(UUID_V4_PATTERN);
  });
});
