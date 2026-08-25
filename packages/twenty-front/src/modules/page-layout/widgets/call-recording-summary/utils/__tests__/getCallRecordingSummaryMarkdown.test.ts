import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { getCallRecordingSummaryMarkdown } from '@/page-layout/widgets/call-recording-summary/utils/getCallRecordingSummaryMarkdown';
import { CallRecordingStatus } from '~/generated/graphql';

const makeCallRecording = (
  summary: CalendarEventCallRecordingCandidate['summary'],
): CalendarEventCallRecordingCandidate => ({
  __typename: 'CallRecording',
  id: 'call-recording-id',
  status: CallRecordingStatus.COMPLETED,
  transcript: null,
  summary,
  video: null,
  createdAt: '2026-01-01T00:00:00Z',
});

describe('getCallRecordingSummaryMarkdown', () => {
  it('returns the trimmed summary markdown', () => {
    expect(
      getCallRecordingSummaryMarkdown(
        makeCallRecording({
          markdown: '\n## Recap\n\nWe agreed on pricing.\n',
        }),
      ),
    ).toBe('## Recap\n\nWe agreed on pricing.');
  });

  it('returns undefined without summary markdown', () => {
    expect(getCallRecordingSummaryMarkdown(undefined)).toBe(undefined);
    expect(getCallRecordingSummaryMarkdown(makeCallRecording(null))).toBe(
      undefined,
    );
    expect(
      getCallRecordingSummaryMarkdown(makeCallRecording({ markdown: null })),
    ).toBe(undefined);
    expect(
      getCallRecordingSummaryMarkdown(makeCallRecording({ markdown: '   \n' })),
    ).toBe(undefined);
  });
});
