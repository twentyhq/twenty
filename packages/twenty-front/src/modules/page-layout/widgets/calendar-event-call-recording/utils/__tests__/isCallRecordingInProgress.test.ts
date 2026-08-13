import { isCallRecordingInProgress } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingInProgress';
import { CallRecordingStatus } from '~/generated/graphql';

const createCallRecording = (status: CallRecordingStatus) => ({
  __typename: 'CallRecording' as const,
  id: 'call-recording-id',
  status,
  transcript: null,
  summary: null,
  createdAt: '2026-08-01T00:00:00.000Z',
});

describe('isCallRecordingInProgress', () => {
  it.each([
    CallRecordingStatus.SCHEDULED,
    CallRecordingStatus.JOINING,
    CallRecordingStatus.RECORDING,
    CallRecordingStatus.PROCESSING,
  ])('is in progress for %s', (status) => {
    expect(isCallRecordingInProgress(createCallRecording(status))).toBe(true);
  });

  it.each([
    CallRecordingStatus.COMPLETED,
    CallRecordingStatus.FAILED,
    CallRecordingStatus.NOT_RECORDED,
  ])('is not in progress for %s', (status) => {
    expect(isCallRecordingInProgress(createCallRecording(status))).toBe(false);
  });
});
