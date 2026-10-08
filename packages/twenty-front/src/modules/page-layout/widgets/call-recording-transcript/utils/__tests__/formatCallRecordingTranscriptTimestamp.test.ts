import { formatCallRecordingTranscriptTimestamp } from '@/page-layout/widgets/call-recording-transcript/utils/formatCallRecordingTranscriptTimestamp';

describe('formatCallRecordingTranscriptTimestamp', () => {
  it.each([
    [0, '0:00'],
    [5.9, '0:05'],
    [65, '1:05'],
    [3661, '1:01:01'],
    [-10, '0:00'],
  ])('formats %s seconds as %s', (seconds, expectedTimestamp) => {
    expect(formatCallRecordingTranscriptTimestamp(seconds)).toBe(
      expectedTimestamp,
    );
  });
});
