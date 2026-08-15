import { isCallRecordingTranscriptPending } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptPending';
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
  createdAt: '2026-08-01T00:00:00.000Z',
});

describe('isCallRecordingTranscriptPending', () => {
  it.each([
    { transcript: null, status: CallRecordingStatus.SCHEDULED },
    { transcript: null, status: CallRecordingStatus.JOINING },
    { transcript: [], status: CallRecordingStatus.RECORDING },
    {
      transcript: { unexpected: true },
      status: CallRecordingStatus.PROCESSING,
    },
    {
      transcript: { status: 'PENDING' },
      status: CallRecordingStatus.COMPLETED,
    },
  ])(
    'is pending for $status with transcript $transcript',
    ({ transcript, status }) => {
      expect(
        isCallRecordingTranscriptPending(
          createCallRecording({ transcript, status }),
        ),
      ).toBe(true);
    },
  );

  it.each([
    { transcript: null, status: CallRecordingStatus.COMPLETED },
    { transcript: [], status: CallRecordingStatus.COMPLETED },
    {
      transcript: { status: 'UNKNOWN' },
      status: CallRecordingStatus.COMPLETED,
    },
    { transcript: { status: 'PENDING' }, status: CallRecordingStatus.FAILED },
    { transcript: [], status: CallRecordingStatus.FAILED },
    { transcript: null, status: CallRecordingStatus.NOT_RECORDED },
  ])(
    'is not pending for $status with transcript $transcript',
    ({ transcript, status }) => {
      expect(
        isCallRecordingTranscriptPending(
          createCallRecording({ transcript, status }),
        ),
      ).toBe(false);
    },
  );
});
