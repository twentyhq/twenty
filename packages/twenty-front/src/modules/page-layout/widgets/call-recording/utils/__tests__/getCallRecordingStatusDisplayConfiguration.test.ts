import { getCallRecordingStatusDisplayConfiguration } from '@/page-layout/widgets/call-recording/utils/getCallRecordingStatusDisplayConfiguration';
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

  it.each(['PENDING', 'FAILED', 'EMPTY'])(
    'does not use a %s transcript marker as the summary status',
    (status) => {
      expect(
        getCallRecordingStatusDisplayConfiguration(
          {
            status: CallRecordingStatus.PROCESSING,
            transcript: { status },
          },
          'summary',
        ).title,
      ).toBe('Processing Recording');
    },
  );

  describe.each([
    CallRecordingStatus.PROCESSING,
    CallRecordingStatus.COMPLETED,
    CallRecordingStatus.FAILED,
  ])('when the recording is %s', (status) => {
    it.each([
      {
        subCode: undefined,
        title: 'No Speech Detected',
        subTitle: 'No speech was detected in this recording.',
      },
      {
        subCode: null,
        title: 'No Speech Detected',
        subTitle: 'No speech was detected in this recording.',
      },
      {
        subCode: 'transcript_expired',
        title: 'Transcript Expired',
        subTitle: 'The transcript expired before it could be imported.',
      },
      {
        subCode: 'transcript_request_rejected:422',
        title: 'Transcript Unavailable',
        subTitle: 'No transcript is available for this recording.',
      },
      {
        subCode: 'provider_specific_reason',
        title: 'Transcript Unavailable',
        subTitle: 'No transcript is available for this recording.',
      },
    ])(
      'explains an empty transcript with reason $subCode',
      ({ subCode, title, subTitle }) => {
        expect(
          getCallRecordingStatusDisplayConfiguration(
            { status, transcript: { status: 'EMPTY', subCode } },
            'transcript',
          ),
        ).toEqual({ title, subTitle });
      },
    );
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
