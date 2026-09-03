import { describe, expect, it } from 'vitest';

import { formatFathomSummary } from 'src/logic-functions/utils/format-fathom-summary.util';

describe('formatFathomSummary', () => {
  it('combines the Fathom summary and action items', () => {
    expect(
      formatFathomSummary({
        summaryMarkdown: '## Summary\n\nPricing was discussed.',
        actionItems: [
          {
            description: 'Send the proposal',
            userGenerated: false,
            completed: false,
            recordingTimestamp: '00:10:45',
            recordingPlaybackUrl: 'https://fathom.video/calls/1?timestamp=645',
            assignee: { name: 'Ada', email: 'ada@example.com', team: null },
          },
        ],
      }),
    ).toBe(
      '## Summary\n\nPricing was discussed.\n\n## Action items\n\n- [ ] Send the proposal — Ada',
    );
  });

  it('returns action items when no summary is available', () => {
    expect(
      formatFathomSummary({
        summaryMarkdown: null,
        actionItems: [
          {
            description: 'Follow up',
            userGenerated: true,
            completed: true,
            recordingTimestamp: '00:01:00',
            recordingPlaybackUrl: 'https://fathom.video/calls/1?timestamp=60',
            assignee: { name: null, email: null, team: null },
          },
        ],
      }),
    ).toBe('## Action items\n\n- [x] Follow up');
  });
});
