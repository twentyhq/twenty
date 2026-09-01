import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { getCallRecordingSummaryMarkdown } from '@/page-layout/widgets/call-recording-summary/utils/getCallRecordingSummaryMarkdown';

const makeCallRecording = (
  summary: WidgetCallRecordingCandidate['summary'],
): WidgetCallRecordingCandidate => ({
  __typename: 'CallRecording',
  id: 'call-recording-id',
  summary,
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
