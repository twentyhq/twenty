import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { getCallRecordingVideoFileUrl } from '@/page-layout/widgets/call-recording/utils/getCallRecordingVideoFileUrl';

const makeCallRecording = (
  video: WidgetCallRecordingCandidate['video'],
): WidgetCallRecordingCandidate => ({
  __typename: 'CallRecording',
  id: 'call-recording-id',
  video,
});

describe('getCallRecordingVideoFileUrl', () => {
  it('returns the first video file url with a non-empty url', () => {
    expect(
      getCallRecordingVideoFileUrl(
        makeCallRecording([
          {
            fileId: 'file-without-url',
            label: 'broken.mp4',
            extension: 'mp4',
          },
          {
            fileId: 'file-with-url',
            label: 'recording.mp4',
            extension: 'mp4',
            url: 'https://files.example.com/recording.mp4',
          },
        ]),
      ),
    ).toBe('https://files.example.com/recording.mp4');
  });

  it('returns undefined without a playable video file', () => {
    expect(getCallRecordingVideoFileUrl(makeCallRecording(null))).toBe(
      undefined,
    );
    expect(getCallRecordingVideoFileUrl(makeCallRecording([]))).toBe(undefined);
  });
});
