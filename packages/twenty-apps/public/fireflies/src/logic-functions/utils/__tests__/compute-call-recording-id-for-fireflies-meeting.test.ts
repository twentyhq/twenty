import { describe, expect, it } from 'vitest';

import { computeCallRecordingIdForFirefliesMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fireflies-meeting';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('computeCallRecordingIdForFirefliesMeeting', () => {
  it('should produce a valid v4-shaped UUID', () => {
    const id = computeCallRecordingIdForFirefliesMeeting('01K1234ABCD');

    expect(id).toMatch(UUID_V4_PATTERN);
  });

  it('should be deterministic for the same meeting id', () => {
    expect(computeCallRecordingIdForFirefliesMeeting('meeting-a')).toBe(
      computeCallRecordingIdForFirefliesMeeting('meeting-a'),
    );
  });

  it('should differ for different meeting ids', () => {
    expect(computeCallRecordingIdForFirefliesMeeting('meeting-a')).not.toBe(
      computeCallRecordingIdForFirefliesMeeting('meeting-b'),
    );
  });
});
