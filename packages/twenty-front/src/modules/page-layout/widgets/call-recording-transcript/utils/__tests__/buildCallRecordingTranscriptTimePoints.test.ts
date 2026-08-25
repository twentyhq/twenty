import { buildCallRecordingTranscriptTimePoints } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptTimePoints';

describe('buildCallRecordingTranscriptTimePoints', () => {
  it('should map timed items to points keeping their original indexes', () => {
    const timePoints = buildCallRecordingTranscriptTimePoints([
      { startSeconds: 1, endSeconds: 2 },
      { startSeconds: 4.5, endSeconds: 6 },
      { startSeconds: 9, endSeconds: undefined },
    ]);

    expect(timePoints).toEqual([
      { startSeconds: 1, endSeconds: 2, index: 0 },
      { startSeconds: 4.5, endSeconds: 6, index: 1 },
      { startSeconds: 9, index: 2 },
    ]);
  });

  it('should skip untimed items without shifting the indexes of timed ones', () => {
    const timePoints = buildCallRecordingTranscriptTimePoints([
      { startSeconds: undefined },
      { startSeconds: 2 },
      { startSeconds: undefined },
      { startSeconds: 7 },
    ]);

    expect(timePoints).toEqual([
      { startSeconds: 2, index: 1 },
      { startSeconds: 7, index: 3 },
    ]);
  });

  it('should return an empty array when no item is timed', () => {
    expect(
      buildCallRecordingTranscriptTimePoints([{ startSeconds: undefined }]),
    ).toEqual([]);
  });

  it('should sort out-of-order items by start time keeping original indexes', () => {
    expect(
      buildCallRecordingTranscriptTimePoints([
        { startSeconds: 9 },
        { startSeconds: 2 },
        { startSeconds: 5 },
      ]),
    ).toEqual([
      { startSeconds: 2, index: 1 },
      { startSeconds: 5, index: 2 },
      { startSeconds: 9, index: 0 },
    ]);
  });
});
