import { describe, expect, it, vi } from 'vitest';

import { findCallRecordingForSummary } from 'src/logic-functions/data/utils/findCallRecordingForSummary';

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
              createdBy: { source: 'APPLICATION', name: 'Desktop Recorder' },
            },
          },
        ],
      },
    });

    const callRecording = await findCallRecordingForSummary(
      { query },
      { id: 'call-recording-1' },
    );

    expect(callRecording?.summaryMarkdown).toBeUndefined();
  });
});
