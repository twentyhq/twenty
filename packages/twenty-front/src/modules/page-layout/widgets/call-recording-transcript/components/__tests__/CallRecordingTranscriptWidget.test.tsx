import { CallRecordingTranscriptWidget } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptWidget';
import { render, screen } from '@testing-library/react';
import { CallRecordingStatus } from '~/generated/graphql';

jest.mock(
  '@/page-layout/widgets/call-recording-transcript/hooks/useCalendarEventCallRecordingTranscript',
  () => ({
    useCalendarEventCallRecordingTranscript: () => ({
      callRecordingTranscriptState: {
        state: 'READY',
        callRecording: {
          __typename: 'CallRecording',
          id: 'call-recording-id',
          status: CallRecordingStatus.COMPLETED,
          transcript: null,
          startedAt: null,
          endedAt: null,
          createdAt: '2026-08-07T00:00:00.000Z',
        },
        entries: Array.from({ length: 75 }, (_, entryIndex) => ({
          speakerName: `Speaker ${entryIndex}`,
          startSeconds: entryIndex,
          endSeconds: entryIndex + 1,
          text: `Transcript entry ${entryIndex}`,
          words: [],
        })),
      },
    }),
  }),
);

describe('CallRecordingTranscriptWidget', () => {
  it('keeps a long transcript inside its scroll-owning container', () => {
    render(<CallRecordingTranscriptWidget />);

    const widget = screen.getByTestId('call-recording-transcript-widget');

    expect(widget).toContainElement(screen.getByText('Transcript entry 0'));
    expect(widget).toContainElement(screen.getByText('Transcript entry 74'));
  });
});
