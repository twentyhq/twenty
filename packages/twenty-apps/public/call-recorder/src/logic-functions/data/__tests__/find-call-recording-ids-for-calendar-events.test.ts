import { describe, expect, it, vi } from 'vitest';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { findCallRecordingIdsForCalendarEvents } from 'src/logic-functions/data/find-call-recording-ids-for-calendar-events.util';

const buildConnection = (callRecordingIds: string[]) => ({
  callRecordings: {
    pageInfo: { hasNextPage: false, endCursor: null },
    edges: callRecordingIds.map((callRecordingId) => ({
      node: { id: callRecordingId },
    })),
  },
});

describe('findCallRecordingIdsForCalendarEvents', () => {
  it('returns nothing without querying when no calendar event ids are given', async () => {
    const query = vi.fn();

    const callRecordingIds = await findCallRecordingIdsForCalendarEvents(
      { query } as never,
      { calendarEventIds: [] },
    );

    expect(callRecordingIds).toEqual([]);
    expect(query).not.toHaveBeenCalled();
  });

  it('chunks calendar event ids before querying call recordings', async () => {
    const calendarEventIds = Array.from(
      { length: TWENTY_PAGE_SIZE + 1 },
      (_, calendarEventIndex) => `calendar-event-${calendarEventIndex}`,
    );
    const query = vi
      .fn()
      .mockResolvedValueOnce(buildConnection(['call-recording-1']))
      .mockResolvedValueOnce(buildConnection(['call-recording-2']));

    const callRecordingIds = await findCallRecordingIdsForCalendarEvents(
      { query } as never,
      { calendarEventIds },
    );

    expect(callRecordingIds).toEqual(['call-recording-1', 'call-recording-2']);
    expect(query).toHaveBeenCalledTimes(2);
    expect(
      query.mock.calls[0][0].callRecordings.__args.filter.calendarEventId.in,
    ).toHaveLength(TWENTY_PAGE_SIZE);
    expect(
      query.mock.calls[1][0].callRecordings.__args.filter.calendarEventId.in,
    ).toEqual(['calendar-event-100']);
  });
});
