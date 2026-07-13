import { getShiftedRecordCalendarDateTime } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDateTime';
import { Temporal } from 'temporal-polyfill';

const timeZone = 'Europe/Paris';

describe('getShiftedRecordCalendarDateTime', () => {
  it('moves a timed event by the rendered day offset and preserves duration', () => {
    expect(
      getShiftedRecordCalendarDateTime({
        sourceDay: Temporal.PlainDate.from('2026-07-08'),
        destinationDay: Temporal.PlainDate.from('2026-07-11'),
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: '2026-07-10T18:59:00Z',
        timeZone,
      }),
    ).toEqual({
      startDateTime: '2026-07-11T15:59:00Z',
      endDateTime: '2026-07-13T18:59:00Z',
    });
  });

  it('moves a continuation fragment by its visual anchor', () => {
    expect(
      getShiftedRecordCalendarDateTime({
        sourceDay: Temporal.PlainDate.from('2026-07-10'),
        destinationDay: Temporal.PlainDate.from('2026-07-11'),
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: '2026-07-10T18:59:00Z',
        timeZone,
      }),
    ).toEqual({
      startDateTime: '2026-07-09T15:59:00Z',
      endDateTime: '2026-07-11T18:59:00Z',
    });
  });

  it('lands on the requested local time and preserves duration across DST', () => {
    expect(
      getShiftedRecordCalendarDateTime({
        sourceDay: Temporal.PlainDate.from('2026-03-28'),
        destinationDay: Temporal.PlainDate.from('2026-03-29'),
        startDateTime: '2026-03-28T09:00:00Z',
        endDateTime: '2026-03-28T11:00:00Z',
        timeZone,
      }),
    ).toEqual({
      startDateTime: '2026-03-29T08:00:00Z',
      endDateTime: '2026-03-29T10:00:00Z',
    });
  });

  it('preserves the later offset when the source start is a repeated DST time', () => {
    expect(
      getShiftedRecordCalendarDateTime({
        sourceDay: Temporal.PlainDate.from('2026-10-25'),
        destinationDay: Temporal.PlainDate.from('2026-10-26'),
        startDateTime: '2026-10-25T01:30:00Z',
        endDateTime: '2026-10-25T02:30:00Z',
        timeZone,
      }),
    ).toEqual({
      startDateTime: '2026-10-26T01:30:00Z',
      endDateTime: '2026-10-26T02:30:00Z',
    });
  });

  it('keeps the local start time when a continuation moves across DST', () => {
    expect(
      getShiftedRecordCalendarDateTime({
        sourceDay: Temporal.PlainDate.from('2026-03-29'),
        destinationDay: Temporal.PlainDate.from('2026-03-30'),
        startDateTime: '2026-03-28T09:00:00Z',
        endDateTime: '2026-03-30T10:00:00Z',
        timeZone,
      }),
    ).toEqual({
      startDateTime: '2026-03-29T08:00:00Z',
      endDateTime: '2026-03-31T09:00:00Z',
    });
  });

  it('does not synthesize an end when it is unusable', () => {
    expect(
      getShiftedRecordCalendarDateTime({
        sourceDay: Temporal.PlainDate.from('2026-07-08'),
        destinationDay: Temporal.PlainDate.from('2026-07-09'),
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: 'not-a-date',
        timeZone,
      }),
    ).toEqual({
      startDateTime: '2026-07-09T15:59:00Z',
    });
  });

  it('shifts an end that is equal to the start', () => {
    expect(
      getShiftedRecordCalendarDateTime({
        sourceDay: Temporal.PlainDate.from('2026-07-08'),
        destinationDay: Temporal.PlainDate.from('2026-07-09'),
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: '2026-07-08T15:59:00Z',
        timeZone,
      }),
    ).toEqual({
      startDateTime: '2026-07-09T15:59:00Z',
      endDateTime: '2026-07-09T15:59:00Z',
    });
  });

  it('returns null for an unusable start', () => {
    expect(
      getShiftedRecordCalendarDateTime({
        sourceDay: Temporal.PlainDate.from('2026-07-08'),
        destinationDay: Temporal.PlainDate.from('2026-07-09'),
        startDateTime: 'not-a-date',
        timeZone,
      }),
    ).toBeNull();
  });
});
