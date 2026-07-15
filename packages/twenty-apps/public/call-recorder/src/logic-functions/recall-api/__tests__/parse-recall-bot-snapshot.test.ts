import { describe, expect, it } from 'vitest';

import { parseRecallBotSnapshot } from 'src/logic-functions/recall-api/parse-recall-bot-snapshot.util';

describe('parseRecallBotSnapshot', () => {
  it('parses id, metadata, status changes and recordings from a bot payload', () => {
    expect(
      parseRecallBotSnapshot({
        id: 'recall-bot-1',
        metadata: { twentyWorkspaceId: 'workspace-1' },
        status_changes: [
          { code: 'in_call_recording', created_at: '2026-01-01T13:02:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            started_at: '2026-01-01T13:02:00.000Z',
            completed_at: '2026-01-01T14:00:00.000Z',
          },
        ],
      }),
    ).toEqual({
      id: 'recall-bot-1',
      metadata: { twentyWorkspaceId: 'workspace-1' },
      statusChanges: [
        { code: 'in_call_recording', createdAt: '2026-01-01T13:02:00.000Z' },
      ],
      recordings: [
        {
          id: 'recall-recording-1',
          startedAt: '2026-01-01T13:02:00.000Z',
          completedAt: '2026-01-01T14:00:00.000Z',
        },
      ],
    });
  });

  it('returns an empty snapshot shell from an empty payload', () => {
    expect(parseRecallBotSnapshot({})).toEqual({
      id: undefined,
      metadata: {},
      statusChanges: [],
      recordings: [],
    });
  });

  it('skips malformed recording entries and keeps recordings without timestamps', () => {
    expect(
      parseRecallBotSnapshot({
        recordings: [null, 'not-a-recording', { id: 'recall-recording-1' }],
      }),
    ).toEqual({
      id: undefined,
      metadata: {},
      statusChanges: [],
      recordings: [
        {
          id: 'recall-recording-1',
          startedAt: undefined,
          completedAt: undefined,
        },
      ],
    });
  });

  it('skips malformed status change entries and non-array recordings', () => {
    expect(
      parseRecallBotSnapshot({
        status_changes: [
          null,
          'not-an-object',
          { created_at: '2026-01-01T13:00:00.000Z' },
          { code: 'in_call_recording', created_at: '2026-01-01T13:02:00.000Z' },
        ],
        recordings: 'not-an-array',
      }),
    ).toEqual({
      id: undefined,
      metadata: {},
      statusChanges: [
        { code: 'in_call_recording', createdAt: '2026-01-01T13:02:00.000Z' },
      ],
      recordings: [],
    });
  });
});
