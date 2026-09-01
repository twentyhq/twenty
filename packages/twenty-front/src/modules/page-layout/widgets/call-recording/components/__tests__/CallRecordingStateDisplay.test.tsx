import { CallRecordingStateDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingStateDisplay';
import { render, screen } from '@testing-library/react';
import { CallRecordingStatus } from '~/generated/graphql';

jest.mock(
  '@/page-layout/widgets/call-recording/components/CallRecordingWidgetEmptyStateDisplay',
  () => ({
    CallRecordingWidgetEmptyStateDisplay: ({ title }: { title: string }) => (
      <div>{title}</div>
    ),
  }),
);

describe('CallRecordingStateDisplay', () => {
  it.each([
    [CallRecordingStatus.SCHEDULED, 'Recording Scheduled'],
    [CallRecordingStatus.JOINING, 'Recorder Joining'],
    [CallRecordingStatus.RECORDING, 'Recording'],
    [CallRecordingStatus.PROCESSING, 'Generating Summary'],
    [CallRecordingStatus.COMPLETED, 'No Summary'],
    [CallRecordingStatus.FAILED, 'Processing Failed'],
    [CallRecordingStatus.NOT_RECORDED, 'Not Recorded'],
  ])('maps %s to its summary state', (status, expectedTitle) => {
    render(
      <CallRecordingStateDisplay
        callRecording={{ status, transcript: null }}
        contentType="summary"
      />,
    );

    expect(screen.getByText(expectedTitle)).toBeVisible();
  });

  it.each([
    [CallRecordingStatus.PROCESSING, 'Preparing Transcript'],
    [CallRecordingStatus.COMPLETED, 'No Transcript'],
    [CallRecordingStatus.FAILED, 'Transcript Failed'],
  ])('maps %s to its transcript state', (status, expectedTitle) => {
    render(
      <CallRecordingStateDisplay
        callRecording={{ status, transcript: null }}
        contentType="transcript"
      />,
    );

    expect(screen.getByText(expectedTitle)).toBeVisible();
  });

  it.each<{
    transcriptStatus: 'PENDING' | 'FAILED';
    expectedTitle: string;
  }>([
    {
      transcriptStatus: 'PENDING',
      expectedTitle: 'Generating Summary',
    },
    {
      transcriptStatus: 'FAILED',
      expectedTitle: 'Processing Failed',
    },
  ])(
    'uses the $transcriptStatus transcript marker when the recording is completed',
    ({ transcriptStatus, expectedTitle }) => {
      render(
        <CallRecordingStateDisplay
          callRecording={{
            status: CallRecordingStatus.COMPLETED,
            transcript: { status: transcriptStatus },
          }}
          contentType="summary"
        />,
      );

      expect(screen.getByText(expectedTitle)).toBeVisible();
    },
  );
});
