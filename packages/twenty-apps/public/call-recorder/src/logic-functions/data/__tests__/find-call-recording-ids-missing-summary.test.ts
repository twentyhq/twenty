import { describe, expect, it, vi } from 'vitest';

import { findCallRecordingIdsMissingSummary } from 'src/logic-functions/data/find-call-recording-ids-missing-summary.util';

const TRANSCRIPT = [
  {
    participant: { name: 'Alex' },
    words: [{ text: 'Hello' }, { text: 'team' }],
  },
];

const buildConnection = (
  nodes: object[],
  pageInfo: { hasNextPage: boolean; endCursor: string | null },
) => ({
  callRecordings: {
    pageInfo,
    edges: nodes.map((node) => ({ node })),
  },
});

describe('findCallRecordingIdsMissingSummary', () => {
  it('targets app-created completed recordings with a transcript', async () => {
    let capturedFilter: unknown;
    const query = vi.fn(async (queryArg: any) => {
      capturedFilter = queryArg.callRecordings.__args.filter;

      return buildConnection([], { hasNextPage: false, endCursor: null });
    });

    await findCallRecordingIdsMissingSummary({ query } as never);

    expect(capturedFilter).toEqual({
      status: { eq: 'COMPLETED' },
      transcript: { is: 'NOT_NULL' },
      createdBy: {
        source: { eq: 'APPLICATION' },
        name: { eq: 'Call Recorder' },
      },
    });
  });

  it('keeps only recordings missing a summary, newest first, across pages', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildConnection(
          [
            {
              id: 'call-recording-old',
              createdAt: '2026-06-01T10:00:00.000Z',
              transcript: TRANSCRIPT,
              summary: null,
            },
            {
              id: 'call-recording-summarized',
              createdAt: '2026-06-20T10:00:00.000Z',
              transcript: TRANSCRIPT,
              summary: { markdown: '## Overview\nDone.' },
            },
          ],
          { hasNextPage: true, endCursor: 'cursor-1' },
        ),
      )
      .mockResolvedValueOnce(
        buildConnection(
          [
            {
              id: 'call-recording-new',
              createdAt: '2026-06-30T10:00:00.000Z',
              transcript: TRANSCRIPT,
              summary: { markdown: '' },
            },
          ],
          { hasNextPage: false, endCursor: 'cursor-2' },
        ),
      );

    const callRecordingIds = await findCallRecordingIdsMissingSummary({
      query,
    } as never);

    expect(callRecordingIds).toEqual([
      'call-recording-new',
      'call-recording-old',
    ]);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('ignores recordings whose transcript cannot produce a summary prompt', async () => {
    const query = vi.fn().mockResolvedValue(
      buildConnection(
        [
          {
            id: 'call-recording-empty-transcript',
            createdAt: '2026-07-01T10:00:00.000Z',
            transcript: [],
            summary: null,
          },
          {
            id: 'call-recording-empty-words',
            createdAt: '2026-06-30T10:00:00.000Z',
            transcript: [
              {
                participant: { name: 'Alex' },
                words: [{ text: '  ' }],
              },
            ],
            summary: null,
          },
          {
            id: 'call-recording-valid',
            createdAt: '2026-06-01T10:00:00.000Z',
            transcript: TRANSCRIPT,
            summary: null,
          },
        ],
        { hasNextPage: false, endCursor: null },
      ),
    );

    const callRecordingIds = await findCallRecordingIdsMissingSummary({
      query,
    } as never);

    expect(callRecordingIds).toEqual(['call-recording-valid']);
  });
});
