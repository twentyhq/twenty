import { describe, expect, it } from 'vitest';

import { UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE } from 'src/logic-functions/constants/upcoming-calendar-event-reconciliation-batch-size';
import { groupUpcomingCalendarEventIdsIntoBatches } from 'src/logic-functions/domain/group-upcoming-calendar-event-ids-into-batches.util';
import { type UpcomingCalendarEvent } from 'src/logic-functions/types/upcoming-calendar-event.type';

const buildStartsAt = (minutesAfterNoon: number): string =>
  new Date(Date.UTC(2026, 6, 4, 12, minutesAfterNoon)).toISOString();

const buildEventsWithDistinctStarts = ({
  count,
  prefix,
}: {
  count: number;
  prefix: string;
}): UpcomingCalendarEvent[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index}`,
    startsAt: buildStartsAt(index),
  }));

const buildEventsSharingStart = ({
  count,
  prefix,
  startsAt,
}: {
  count: number;
  prefix: string;
  startsAt: string | undefined;
}): UpcomingCalendarEvent[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index}`,
    startsAt,
  }));

describe('groupUpcomingCalendarEventIdsIntoBatches', () => {
  it('returns no batches when nothing is upcoming', () => {
    expect(groupUpcomingCalendarEventIdsIntoBatches([])).toEqual([]);
  });

  it('keeps calendar copies of one meeting in one batch even when their ids sort apart', () => {
    const otherMeetings = buildEventsWithDistinctStarts({
      count: UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE - 1,
      prefix: 'b-other',
    });
    const sharedStartsAt = buildStartsAt(
      UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE,
    );

    const batches = groupUpcomingCalendarEventIdsIntoBatches([
      { id: 'a-copy', startsAt: sharedStartsAt },
      ...otherMeetings,
      { id: 'z-copy', startsAt: sharedStartsAt },
    ]);

    expect(batches).toEqual([
      otherMeetings.map((upcomingCalendarEvent) => upcomingCalendarEvent.id),
      ['a-copy', 'z-copy'],
    ]);
  });

  it('hands out batches soonest meeting first', () => {
    const batches = groupUpcomingCalendarEventIdsIntoBatches([
      { id: 'later', startsAt: '2026-07-05T09:00:00.000Z' },
      { id: 'soonest', startsAt: '2026-07-04T09:00:00.000Z' },
      { id: 'middle', startsAt: '2026-07-04T15:00:00.000Z' },
    ]);

    expect(batches).toEqual([['soonest', 'middle', 'later']]);
  });

  it('keeps a start time shared by more events than the batch size whole', () => {
    const oversizedGroup = buildEventsSharingStart({
      count: UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE + 5,
      prefix: 'all-hands',
      startsAt: buildStartsAt(30),
    });

    const batches = groupUpcomingCalendarEventIdsIntoBatches([
      { id: 'before', startsAt: buildStartsAt(0) },
      ...oversizedGroup,
      { id: 'after', startsAt: buildStartsAt(60) },
    ]);

    expect(batches).toEqual([
      ['before'],
      oversizedGroup.map((upcomingCalendarEvent) => upcomingCalendarEvent.id),
      ['after'],
    ]);
  });

  it('fills a batch exactly to the batch size before starting the next one', () => {
    const upcomingCalendarEvents = buildEventsWithDistinctStarts({
      count: UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE * 2 + 1,
      prefix: 'meeting',
    });

    const batches = groupUpcomingCalendarEventIdsIntoBatches(
      upcomingCalendarEvents,
    );

    expect(batches.map((batch) => batch.length)).toEqual([
      UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE,
      UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE,
      1,
    ]);
    expect(batches.flat()).toEqual(
      upcomingCalendarEvents.map(
        (upcomingCalendarEvent) => upcomingCalendarEvent.id,
      ),
    );
  });

  it('starts a new batch when a group would push the current one past the batch size', () => {
    const firstMeetings = buildEventsWithDistinctStarts({
      count: UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE - 1,
      prefix: 'first',
    });
    const pairedMeeting = buildEventsSharingStart({
      count: 2,
      prefix: 'paired',
      startsAt: buildStartsAt(
        UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE,
      ),
    });

    const batches = groupUpcomingCalendarEventIdsIntoBatches([
      ...firstMeetings,
      ...pairedMeeting,
    ]);

    expect(batches.map((batch) => batch.length)).toEqual([
      UPCOMING_CALENDAR_EVENT_RECONCILIATION_BATCH_SIZE - 1,
      2,
    ]);
  });

  it('puts every event without a start time together, after the dated ones', () => {
    const batches = groupUpcomingCalendarEventIdsIntoBatches([
      { id: 'undated-1', startsAt: undefined },
      { id: 'dated', startsAt: buildStartsAt(0) },
      { id: 'undated-2', startsAt: undefined },
    ]);

    expect(batches).toEqual([['dated', 'undated-1', 'undated-2']]);
  });

  it('lists an event returned twice only once', () => {
    const batches = groupUpcomingCalendarEventIdsIntoBatches([
      { id: 'meeting', startsAt: buildStartsAt(0) },
      { id: 'meeting', startsAt: buildStartsAt(0) },
    ]);

    expect(batches).toEqual([['meeting']]);
  });
});
