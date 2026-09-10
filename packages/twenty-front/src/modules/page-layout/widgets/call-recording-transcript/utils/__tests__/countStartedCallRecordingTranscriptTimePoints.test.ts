import { countStartedCallRecordingTranscriptTimePoints } from '@/page-layout/widgets/call-recording-transcript/utils/countStartedCallRecordingTranscriptTimePoints';

const TIME_POINTS = [
  { startSeconds: 1, index: 0 },
  { startSeconds: 4.5, index: 1 },
  { startSeconds: 9, index: 2 },
];

describe('countStartedCallRecordingTranscriptTimePoints', () => {
  it('should return zero before the first point starts', () => {
    expect(
      countStartedCallRecordingTranscriptTimePoints({
        timePoints: TIME_POINTS,
        currentTimeSeconds: 0.5,
      }),
    ).toBe(0);
  });

  it('should count a point as started within the seek tolerance before its start', () => {
    expect(
      countStartedCallRecordingTranscriptTimePoints({
        timePoints: TIME_POINTS,
        currentTimeSeconds: 0.995,
      }),
    ).toBe(1);
  });

  it('should count a point as started at its exact start time', () => {
    expect(
      countStartedCallRecordingTranscriptTimePoints({
        timePoints: TIME_POINTS,
        currentTimeSeconds: 4.5,
      }),
    ).toBe(2);
  });

  it('should count points between two starts', () => {
    expect(
      countStartedCallRecordingTranscriptTimePoints({
        timePoints: TIME_POINTS,
        currentTimeSeconds: 5,
      }),
    ).toBe(2);
  });

  it('should count every point after the last start', () => {
    expect(
      countStartedCallRecordingTranscriptTimePoints({
        timePoints: TIME_POINTS,
        currentTimeSeconds: 3600,
      }),
    ).toBe(3);
  });

  it('should return zero for an empty point list', () => {
    expect(
      countStartedCallRecordingTranscriptTimePoints({
        timePoints: [],
        currentTimeSeconds: 10,
      }),
    ).toBe(0);
  });
});
