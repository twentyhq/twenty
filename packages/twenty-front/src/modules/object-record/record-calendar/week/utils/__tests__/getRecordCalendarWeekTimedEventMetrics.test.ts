import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';
import { getRecordCalendarWeekTimedEventMetrics } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekTimedEventMetrics';

const timeZone = 'Europe/Paris';

describe('getRecordCalendarWeekTimedEventMetrics', () => {
  it('uses the configured duration', () => {
    expect(
      getRecordCalendarWeekTimedEventMetrics({
        startDateTime: '2026-07-06T07:00:00Z',
        endDateTime: '2026-07-06T08:30:00Z',
        timeZone,
      }),
    ).toEqual({
      startInPixels: 9 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
      endInPixels: 10.5 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
    });
  });

  it.each([undefined, null, 'not-a-date', '2026-07-06T06:00:00Z'])(
    'falls back to one hour for an unusable end value: %s',
    (endDateTime) => {
      expect(
        getRecordCalendarWeekTimedEventMetrics({
          startDateTime: '2026-07-06T07:00:00Z',
          endDateTime,
          timeZone,
        }),
      ).toEqual({
        startInPixels: 9 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
        endInPixels: 10 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
      });
    },
  );

  it('keeps short events large enough to interact with', () => {
    expect(
      getRecordCalendarWeekTimedEventMetrics({
        startDateTime: '2026-07-06T07:00:00Z',
        endDateTime: '2026-07-06T07:05:00Z',
        timeZone,
      }),
    ).toEqual({
      startInPixels: 9 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
      endInPixels: 9.5 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
    });
  });

  it('clips an event ending on a later day to the grid boundary', () => {
    expect(
      getRecordCalendarWeekTimedEventMetrics({
        startDateTime: '2026-07-06T21:00:00Z',
        endDateTime: '2026-07-07T01:00:00Z',
        timeZone,
      }),
    ).toEqual({
      startInPixels: 23 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
      endInPixels: RECORD_CALENDAR_WEEK_DIMENSIONS.gridHeight,
    });
  });

  it('clips the one-hour fallback at the grid boundary', () => {
    expect(
      getRecordCalendarWeekTimedEventMetrics({
        startDateTime: '2026-07-06T21:30:00Z',
        timeZone,
      }),
    ).toEqual({
      startInPixels: 23.5 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
      endInPixels: RECORD_CALENDAR_WEEK_DIMENSIONS.gridHeight,
    });
  });

  it('positions instants using the configured timezone', () => {
    expect(
      getRecordCalendarWeekTimedEventMetrics({
        startDateTime: '2026-07-06T09:00:00Z',
        timeZone,
      }),
    ).toEqual({
      startInPixels: 11 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
      endInPixels: 12 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
    });
  });

  it('returns null for an unusable start value', () => {
    expect(
      getRecordCalendarWeekTimedEventMetrics({
        startDateTime: 'not-a-date',
        timeZone,
      }),
    ).toBeNull();
  });
});
