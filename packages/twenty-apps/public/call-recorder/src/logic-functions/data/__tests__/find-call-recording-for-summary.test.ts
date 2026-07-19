import { describe, expect, it, vi } from 'vitest';

import { findCallRecordingForSummary } from 'src/logic-functions/data/find-call-recording-for-summary.util';

describe('findCallRecordingForSummary', () => {
  it('treats blank summary markdown as missing', async () => {
    const query = vi.fn().mockResolvedValue({
      callRecordings: {
        edges: [
          {
            node: {
              id: 'call-recording-1',
              title: 'Weekly sync',
              transcript: [],
              summary: { markdown: '' },
              createdBy: { source: 'APPLICATION', name: 'Call Recorder' },
            },
          },
        ],
      },
    });

    const callRecording = await findCallRecordingForSummary(
      { query } as never,
      { id: 'call-recording-1' },
    );

    expect(callRecording?.summaryMarkdown).toBeUndefined();
  });
});
