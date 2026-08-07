import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { type CalendarEventCallRecordingTranscriptWidgetState } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptWidgetState';
import { render, screen } from '@testing-library/react';
import { CallRecordingStatus } from '~/generated/graphql';

const callRecording = {
  __typename: 'CallRecording',
  id: 'call-recording-id',
  status: CallRecordingStatus.COMPLETED,
  transcript: null,
  createdAt: '2026-08-07T10:00:00.000Z',
};

const renderState = (
  callRecordingTranscriptState: CalendarEventCallRecordingTranscriptWidgetState,
) =>
  render(
    <CallRecordingTranscriptBody
      callRecordingTranscriptState={callRecordingTranscriptState}
    />,
  );

describe('CallRecordingTranscriptBody', () => {
  it.each([
    ['QUERY_ERROR', 'The transcript could not be loaded.'],
    ['FORBIDDEN', "You don't have permission to view call recordings."],
    ['UNSUPPORTED', 'Open a calendar event to view its transcript.'],
    ['NO_RECORDING', 'No call recording exists for this calendar event yet.'],
  ] as const)('renders the %s state', (state, message) => {
    renderState({ state });

    expect(screen.getByText(message)).toBeVisible();
  });

  it.each([
    ['PENDING', 'Transcript is being prepared…'],
    ['FAILED', 'The transcript could not be generated.'],
    ['EMPTY', 'The transcript is empty.'],
    ['MISSING', 'No transcript is available for this recording.'],
    ['UNRECOGNIZED', 'Unrecognized transcript format.'],
  ] as const)('renders the selected %s recording state', (state, message) => {
    renderState({ state, callRecording });

    expect(screen.getByText(message)).toBeVisible();
  });

  it('renders native transcript rows with a speaker fallback and timestamp', () => {
    renderState({
      state: 'READY',
      callRecording,
      entries: [
        {
          speakerName: 'Ada',
          startSeconds: 5,
          endSeconds: 8,
          text: 'The first transcript entry.',
          words: [],
        },
        {
          speakerName: undefined,
          startSeconds: undefined,
          endSeconds: undefined,
          text: 'The second transcript entry.',
          words: [],
        },
      ],
    });

    expect(screen.getByText('Ada')).toBeVisible();
    expect(screen.getByText('0:05')).toBeVisible();
    expect(screen.getByText('Unknown speaker')).toBeVisible();
    expect(screen.getByText('The first transcript entry.')).toBeVisible();
    expect(screen.getByText('The second transcript entry.')).toBeVisible();
  });
});
