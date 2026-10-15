import { describe, expect, it } from 'vitest';

import { computeCallRecordingIdForTeamsTranscript } from 'src/features/transcripts/logic-functions/utils/compute-call-recording-id-for-teams-transcript';

describe('computeCallRecordingIdForTeamsTranscript', () => {
  it('should derive one stable UUID v4 per Graph transcript id', () => {
    const transcriptId =
      'MSMjMCMjNzU3ODc2ZDYtOTcwMi00MDhkLWFkNDItOTE2ZDNmZjkwZGY4';
    const callRecordingId =
      computeCallRecordingIdForTeamsTranscript(transcriptId);

    expect(callRecordingId).toMatch(
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/,
    );
    expect(computeCallRecordingIdForTeamsTranscript(transcriptId)).toBe(
      callRecordingId,
    );
    expect(
      computeCallRecordingIdForTeamsTranscript('MSMjMCMjYW5vdGhlcg=='),
    ).not.toBe(callRecordingId);
  });
});
