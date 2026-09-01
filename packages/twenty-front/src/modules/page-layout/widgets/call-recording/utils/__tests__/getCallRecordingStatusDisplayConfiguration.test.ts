import { getCallRecordingStatusDisplayConfiguration } from '@/page-layout/widgets/call-recording/utils/getCallRecordingStatusDisplayConfiguration.util';
import { CallRecordingStatus } from '~/generated/graphql';

describe('getCallRecordingStatusDisplayConfiguration', () => {
  it.each([
    [CallRecordingStatus.SCHEDULED, 'Recording Scheduled'],
    [CallRecordingStatus.JOINING, 'Recorder Joining'],
    [CallRecordingStatus.RECORDING, 'Recording'],
    [CallRecordingStatus.PROCESSING, 'Processing Recording'],
    [CallRecordingStatus.COMPLETED, 'Summary Not Available'],
    [CallRecordingStatus.FAILED, 'Recording Failed'],
    [CallRecordingStatus.NOT_RECORDED, 'Not Recorded'],
  ])('maps %s to its summary state', (status, expectedTitle) => {
    expect(
      getCallRecordingStatusDisplayConfiguration(
        { status, transcript: null },
        'summary',
      ).title,
    ).toBe(expectedTitle);
  });

  it.each([
    ['PENDING', CallRecordingStatus.PROCESSING, 'Preparing Transcript'],
    ['FAILED', CallRecordingStatus.FAILED, 'Transcript Failed'],
  ] as const)(
    'uses the %s transcript marker instead of the recording status',
    (transcriptStatus, recordingStatus, expectedTitle) => {
      expect(
        getCallRecordingStatusDisplayConfiguration(
          {
            status: recordingStatus,
            transcript: { status: transcriptStatus },
          },
          'transcript',
        ).title,
      ).toBe(expectedTitle);
    },
  );

  it('does not use a transcript marker as the summary status', () => {
    expect(
      getCallRecordingStatusDisplayConfiguration(
        {
          status: CallRecordingStatus.PROCESSING,
          transcript: { status: 'PENDING' },
        },
        'summary',
      ).title,
    ).toBe('Processing Recording');
  });

  it('shows the transcript empty state after recording completion', () => {
    expect(
      getCallRecordingStatusDisplayConfiguration(
        {
          status: CallRecordingStatus.COMPLETED,
          transcript: null,
        },
        'transcript',
      ).title,
    ).toBe('No Transcript');
  });
});
