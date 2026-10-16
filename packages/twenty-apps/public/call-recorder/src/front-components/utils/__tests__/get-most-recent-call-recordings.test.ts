import { describe, expect, it } from 'vitest';

import { getMostRecentCallRecordings } from 'src/front-components/utils/get-most-recent-call-recordings.util';

describe('getMostRecentCallRecordings', () => {
  it('orders by the displayed date: start time, else meeting start, else creation', () => {
    const callRecordings = getMostRecentCallRecordings({
      callRecordings: [
        {
          id: 'started-january',
          startedAt: '2026-01-01T10:00:00.000Z',
          createdAt: '2026-05-01T10:00:00.000Z',
        },
        {
          id: 'meeting-april',
          startedAt: null,
          createdAt: '2025-12-01T10:00:00.000Z',
          calendarEvent: {
            id: 'calendar-event',
            startsAt: '2026-04-01T10:00:00.000Z',
          },
        },
        {
          id: 'created-march',
          startedAt: null,
          createdAt: '2026-03-01T10:00:00.000Z',
          calendarEvent: null,
        },
        {
          id: 'started-february',
          startedAt: '2026-02-01T10:00:00.000Z',
          createdAt: '2026-02-01T10:00:00.000Z',
        },
      ],
      maxCount: 10,
    });

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'meeting-april',
      'created-march',
      'started-february',
      'started-january',
    ]);
  });

  it('puts recordings without any valid date last', () => {
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

  it('caps by the displayed date and drops duplicates returned by several batches', () => {
    const callRecordings = getMostRecentCallRecordings({
      callRecordings: [
        { id: 'c', startedAt: '2026-01-01T10:00:00.000Z' },
        { id: 'a', startedAt: '2026-01-03T10:00:00.000Z' },
        {
          id: 'b',
          startedAt: null,
          calendarEvent: { id: 'event', startsAt: '2026-01-02T10:00:00.000Z' },
        },
        { id: 'a', startedAt: '2026-01-03T10:00:00.000Z' },
      ],
      maxCount: 2,
    });

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'a',
      'b',
    ]);
  });
});
