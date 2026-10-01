import { getRecordTimelineBarPosition } from '@/object-record/record-timeline/utils/getRecordTimelineBarPosition';
import { Temporal } from 'temporal-polyfill';

const windowFirstDay = Temporal.PlainDate.from('2026-10-01');
const windowLastDay = Temporal.PlainDate.from('2026-10-31');

describe('getRecordTimelineBarPosition', () => {
  it('spans from start to end inclusive', () => {
    expect(
      getRecordTimelineBarPosition({
        startDay: Temporal.PlainDate.from('2026-10-05'),
        endDay: Temporal.PlainDate.from('2026-10-07'),
        windowFirstDay,
        windowLastDay,
      }),
    ).toEqual({
      startDayIndex: 4,
      daySpan: 3,
      startsBeforeWindow: false,
      endsAfterWindow: false,
    });
  });

  it('renders a one-day bar when the end date is missing', () => {
    expect(
      getRecordTimelineBarPosition({
        startDay: Temporal.PlainDate.from('2026-10-05'),
        endDay: undefined,
        windowFirstDay,
        windowLastDay,
      }),
    ).toMatchObject({ startDayIndex: 4, daySpan: 1 });
  });

  it('renders a one-day bar when the end date is before the start date', () => {
    expect(
      getRecordTimelineBarPosition({
        startDay: Temporal.PlainDate.from('2026-10-05'),
        endDay: Temporal.PlainDate.from('2026-10-01'),
        windowFirstDay,
        windowLastDay,
      }),
    ).toMatchObject({ startDayIndex: 4, daySpan: 1 });
  });

  it('clips bars that overflow the window on both sides', () => {
    expect(
      getRecordTimelineBarPosition({
        startDay: Temporal.PlainDate.from('2026-09-20'),
        endDay: Temporal.PlainDate.from('2026-11-10'),
        windowFirstDay,
        windowLastDay,
      }),
    ).toEqual({
      startDayIndex: 0,
      daySpan: 31,
      startsBeforeWindow: true,
      endsAfterWindow: true,
    });
  });

  it('returns undefined for bars outside the window', () => {
    expect(
      getRecordTimelineBarPosition({
        startDay: Temporal.PlainDate.from('2026-09-01'),
        endDay: Temporal.PlainDate.from('2026-09-30'),
        windowFirstDay,
        windowLastDay,
      }),
    ).toBeUndefined();
    expect(
      getRecordTimelineBarPosition({
        startDay: Temporal.PlainDate.from('2026-11-01'),
        endDay: undefined,
        windowFirstDay,
        windowLastDay,
      }),
    ).toBeUndefined();
  });
});
