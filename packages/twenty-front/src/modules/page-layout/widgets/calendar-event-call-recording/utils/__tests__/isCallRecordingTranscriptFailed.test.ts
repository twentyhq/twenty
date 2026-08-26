import { isCallRecordingTranscriptFailed } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptFailed';
import { CallRecordingStatus } from '~/generated/graphql';

const createCallRecording = ({
  transcript,
  status,
}: {
  transcript: unknown;
  status: CallRecordingStatus;
}) => ({
  __typename: 'CallRecording' as const,
  id: 'call-recording-id',
  status,
  transcript,
  summary: null,
  video: null,
  createdAt: '2026-08-01T00:00:00.000Z',
});

describe('isCallRecordingTranscriptFailed', () => {
  it.each([
    { transcript: null, status: CallRecordingStatus.FAILED },
    { transcript: null, status: CallRecordingStatus.NOT_RECORDED },
    { transcript: [], status: CallRecordingStatus.FAILED },
    {
      transcript: { unexpected: true },
      status: CallRecordingStatus.NOT_RECORDED,
    },
    { transcript: { status: 'PENDING' }, status: CallRecordingStatus.FAILED },
    { transcript: { status: 'FAILED' }, status: CallRecordingStatus.COMPLETED },
    {
      transcript: { status: 'FAILED' },
      status: CallRecordingStatus.PROCESSING,
    },
  ])(
    'is failed for $status with transcript $transcript',
    ({ transcript, status }) => {
      expect(
        isCallRecordingTranscriptFailed(
          createCallRecording({ transcript, status }),
        ),
      ).toBe(true);
    },
  );

  it.each([
    { transcript: null, status: CallRecordingStatus.COMPLETED },
    { transcript: [], status: CallRecordingStatus.COMPLETED },
    {
      transcript: { status: 'PENDING' },
      status: CallRecordingStatus.COMPLETED,
    },
    {
      transcript: { status: 'UNKNOWN' },
      status: CallRecordingStatus.COMPLETED,
    },
    { transcript: null, status: CallRecordingStatus.PROCESSING },
  ])(
    'is not failed for $status with transcript $transcript',
    ({ transcript, status }) => {
      expect(
        isCallRecordingTranscriptFailed(
          createCallRecording({ transcript, status }),
        ),
      ).toBe(false);
    },
  );
});
