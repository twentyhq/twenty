import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';
import {
  getRecordCalendarWeekTimedEventHeight,
  getRecordCalendarWeekTimedEventMetrics,
} from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekTimedEventMetrics';
import { Temporal } from 'temporal-polyfill';

const timeZone = 'Europe/Paris';
const day = Temporal.PlainDate.from('2026-07-06');

describe('getRecordCalendarWeekTimedEventMetrics', () => {
  it('uses the configured duration', () => {
    expect(
      getRecordCalendarWeekTimedEventMetrics({
        day,
        startDateTime: '2026-07-06T07:00:00Z',
        endDateTime: '2026-07-06T08:30:00Z',
        timeZone,
      }),
    ).toEqual({
      startInPixels: 9 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
      endInPixels: 10.5 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
    });
  });

  it('renders a one-hour event with the vertical inset from the design', () => {
    const metrics = getRecordCalendarWeekTimedEventMetrics({
      day,
      startDateTime: '2026-07-06T07:00:00Z',
      timeZone,
    });

    expect(getRecordCalendarWeekTimedEventHeight(metrics!)).toBe(40);
  });

  it.each([undefined, null, 'not-a-date', '2026-07-06T06:00:00Z'])(
    'falls back to one hour for an unusable end value: %s',
    (endDateTime) => {
      expect(
        getRecordCalendarWeekTimedEventMetrics({
          day,
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
    const metrics = getRecordCalendarWeekTimedEventMetrics({
      day,
      startDateTime: '2026-07-06T07:00:00Z',
      endDateTime: '2026-07-06T07:05:00Z',
      timeZone,
    });

    expect(metrics).toEqual({
      startInPixels: 9 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
      endInPixels: 9.5 * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
    });
    expect(getRecordCalendarWeekTimedEventHeight(metrics!)).toBe(
      RECORD_CALENDAR_WEEK_DIMENSIONS.minimumEventSlotHeight,
    );
  });

  it('renders the start-day fragment of a multi-day event to midnight', () => {
    expect(
      getRecordCalendarWeekTimedEventMetrics({
        day: Temporal.PlainDate.from('2026-07-08'),
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: '2026-07-10T18:59:00Z',
        timeZone,
      }),
    ).toEqual({
      startInPixels:
        (17 + 59 / 60) * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
      endInPixels: RECORD_CALENDAR_WEEK_DIMENSIONS.gridHeight,
    });
  });

  it('renders a full-day middle fragment of a multi-day event', () => {
    expect(
      getRecordCalendarWeekTimedEventMetrics({
        day: Temporal.PlainDate.from('2026-07-09'),
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: '2026-07-10T18:59:00Z',
        timeZone,
      }),
    ).toEqual({
      startInPixels: 0,
      endInPixels: RECORD_CALENDAR_WEEK_DIMENSIONS.gridHeight,
    });
  });

  it('renders the end-day fragment of a multi-day event to its end time', () => {
    expect(
      getRecordCalendarWeekTimedEventMetrics({
        day: Temporal.PlainDate.from('2026-07-10'),
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: '2026-07-10T18:59:00Z',
        timeZone,
      }),
    ).toEqual({
      startInPixels: 0,
      endInPixels: (20 + 59 / 60) * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight,
    });
  });

  it('does not render a multi-day event outside its range', () => {
    expect(
      getRecordCalendarWeekTimedEventMetrics({
        day: Temporal.PlainDate.from('2026-07-11'),
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: '2026-07-10T18:59:00Z',
        timeZone,
      }),
    ).toBeNull();
  });

  it('clips the one-hour fallback at the grid boundary', () => {
    expect(
      getRecordCalendarWeekTimedEventMetrics({
        day,
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
        day,
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
        day,
        startDateTime: 'not-a-date',
        timeZone,
      }),
    ).toBeNull();
  });
});
