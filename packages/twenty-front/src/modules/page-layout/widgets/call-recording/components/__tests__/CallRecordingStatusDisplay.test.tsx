import { CallRecordingStatusDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingStatusDisplay';
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

describe('CallRecordingStatusDisplay', () => {
  it.each([
    [CallRecordingStatus.SCHEDULED, 'Recording Scheduled'],
    [CallRecordingStatus.JOINING, 'Recorder Joining'],
    [CallRecordingStatus.RECORDING, 'Recording'],
    [CallRecordingStatus.PROCESSING, 'Processing Recording'],
    [CallRecordingStatus.COMPLETED, 'No Summary'],
    [CallRecordingStatus.FAILED, 'Recording Failed'],
    [CallRecordingStatus.NOT_RECORDED, 'Not Recorded'],
  ])('maps %s to its user-facing state', (status, expectedTitle) => {
    render(
      <CallRecordingStatusDisplay
        callRecording={{ status, transcript: null }}
        artifactType="summary"
      />,
    );

    expect(screen.getByText(expectedTitle)).toBeVisible();
  });

  it.each([
    ['PENDING', 'Preparing Transcript'],
    ['FAILED', 'Transcript Failed'],
  ] as const)(
    'uses the %s transcript state after recording completion',
    (transcriptStatus, expectedTitle) => {
      render(
        <CallRecordingStatusDisplay
          callRecording={{
            status: CallRecordingStatus.COMPLETED,
            transcript: { status: transcriptStatus },
          }}
          artifactType="transcript"
        />,
      );

      expect(screen.getByText(expectedTitle)).toBeVisible();
    },
  );

  it('shows the transcript empty state after recording completion', () => {
    render(
      <CallRecordingStatusDisplay
        callRecording={{
          status: CallRecordingStatus.COMPLETED,
          transcript: null,
        }}
        artifactType="transcript"
      />,
    );

    expect(screen.getByText('No Transcript')).toBeVisible();
  });

  it.each(['PENDING', 'FAILED'] as const)(
    'does not present transcript %s as summary generation',
    (transcriptStatus) => {
      render(
        <CallRecordingStatusDisplay
          callRecording={{
            status: CallRecordingStatus.COMPLETED,
            transcript: { status: transcriptStatus },
          }}
          artifactType="summary"
        />,
      );

      expect(screen.getByText('No Summary')).toBeVisible();
    },
  );
});
