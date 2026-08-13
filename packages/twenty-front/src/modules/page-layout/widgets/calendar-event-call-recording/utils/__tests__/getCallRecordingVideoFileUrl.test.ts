import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { getCallRecordingVideoFileUrl } from '@/page-layout/widgets/calendar-event-call-recording/utils/getCallRecordingVideoFileUrl';
import { CallRecordingStatus } from '~/generated/graphql';

const makeCallRecording = (
  video: CalendarEventCallRecordingCandidate['video'],
): CalendarEventCallRecordingCandidate => ({
  __typename: 'CallRecording',
  id: 'call-recording-id',
  status: CallRecordingStatus.COMPLETED,
  transcript: null,
  summary: null,
  video,
  createdAt: '2026-01-01T00:00:00Z',
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
