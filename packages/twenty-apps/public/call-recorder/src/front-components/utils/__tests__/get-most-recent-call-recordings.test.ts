import { describe, expect, it } from 'vitest';

import { getMostRecentCallRecordings } from 'src/front-components/utils/get-most-recent-call-recordings.util';

describe('getMostRecentCallRecordings', () => {
  it('orders by start time, then creation time, most recent first', () => {
    const callRecordings = getMostRecentCallRecordings({
      callRecordings: [
        {
          id: 'older-start',
          startedAt: '2026-01-01T10:00:00.000Z',
          createdAt: '2026-03-01T10:00:00.000Z',
        },
        {
          id: 'never-started',
          startedAt: null,
          createdAt: '2026-04-01T10:00:00.000Z',
        },
        {
          id: 'newer-start',
          startedAt: '2026-02-01T10:00:00.000Z',
          createdAt: '2026-02-01T10:00:00.000Z',
        },
        {
          id: 'same-start-newer-creation',
          startedAt: '2026-01-01T10:00:00.000Z',
          createdAt: '2026-03-02T10:00:00.000Z',
        },
      ],
      maxCount: 10,
    });

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'newer-start',
      'same-start-newer-creation',
      'older-start',
      'never-started',
    ]);
  });

  it('treats an unparseable start time as missing', () => {
    const callRecordings = getMostRecentCallRecordings({
      callRecordings: [
        { id: 'invalid', startedAt: 'not a date' },
        { id: 'valid', startedAt: '2026-01-01T10:00:00.000Z' },
      ],
      maxCount: 10,
    });

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'valid',
      'invalid',
    ]);
  });

  it('caps the result and drops duplicates returned by several batches', () => {
    const callRecordings = getMostRecentCallRecordings({
      callRecordings: [
        { id: 'a', startedAt: '2026-01-03T10:00:00.000Z' },
        { id: 'b', startedAt: '2026-01-02T10:00:00.000Z' },
        { id: 'a', startedAt: '2026-01-03T10:00:00.000Z' },
        { id: 'c', startedAt: '2026-01-01T10:00:00.000Z' },
      ],
      maxCount: 2,
    });

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'a',
      'b',
    ]);
  });
});
