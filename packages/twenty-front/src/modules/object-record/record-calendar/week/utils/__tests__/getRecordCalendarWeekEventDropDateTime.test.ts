import { getRecordCalendarWeekEventDropDateTime } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekEventDropDateTime';
import { Temporal } from 'temporal-polyfill';

describe('getRecordCalendarWeekEventDropDateTime', () => {
  it('moves a multi-day event start to the drop position from any fragment', () => {
    expect(
      getRecordCalendarWeekEventDropDateTime({
        destinationDay: Temporal.PlainDate.from('2026-07-10'),
        destinationMinutes: 10 * 60,
        startDateTime: '2026-07-07T07:00:00Z',
        endDateTime: '2026-07-09T10:00:00Z',
        timeZone: 'Europe/Paris',
      }),
    ).toEqual({
      startDateTime: '2026-07-10T08:00:00Z',
      endDateTime: '2026-07-12T11:00:00Z',
    });
  });

  it('lands at the drop time when the original start is the later repeated DST time', () => {
    expect(
      getRecordCalendarWeekEventDropDateTime({
        destinationDay: Temporal.PlainDate.from('2026-10-26'),
        destinationMinutes: 10 * 60,
        startDateTime: '2026-10-25T01:30:00Z',
        endDateTime: '2026-10-25T02:30:00Z',
        timeZone: 'Europe/Paris',
      }),
    ).toEqual({
      startDateTime: '2026-10-26T09:00:00Z',
      endDateTime: '2026-10-26T10:00:00Z',
    });
  });

  it('shifts an end that is equal to the start', () => {
    expect(
      getRecordCalendarWeekEventDropDateTime({
        destinationDay: Temporal.PlainDate.from('2026-07-10'),
        destinationMinutes: 10 * 60,
        startDateTime: '2026-07-07T07:00:00Z',
        endDateTime: '2026-07-07T07:00:00Z',
        timeZone: 'Europe/Paris',
      }),
    ).toEqual({
      startDateTime: '2026-07-10T08:00:00Z',
      endDateTime: '2026-07-10T08:00:00Z',
    });
  });
});
