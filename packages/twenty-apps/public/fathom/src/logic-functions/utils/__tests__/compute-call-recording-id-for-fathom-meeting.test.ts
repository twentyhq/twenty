import { describe, expect, it } from 'vitest';

import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';

describe('computeCallRecordingIdForFathomMeeting', () => {
  it('returns one stable UUID for a Fathom recording', () => {
    const firstId = computeCallRecordingIdForFathomMeeting(123456789);
    const secondId = computeCallRecordingIdForFathomMeeting(123456789);

    expect(firstId).toBe(secondId);
    expect(firstId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('uses a different UUID for a different recording', () => {
    expect(computeCallRecordingIdForFathomMeeting(1)).not.toBe(
      computeCallRecordingIdForFathomMeeting(2),
    );
  });
});
