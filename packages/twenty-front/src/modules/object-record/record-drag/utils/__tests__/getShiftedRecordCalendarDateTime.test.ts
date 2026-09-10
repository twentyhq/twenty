import { getShiftedRecordCalendarDateTime } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDateTime';

const timeZone = 'Europe/Paris';

describe('getShiftedRecordCalendarDateTime', () => {
  it('moves a date-time by the day offset without changing the time', () => {
    expect(
      getShiftedRecordCalendarDateTime({
        dayOffset: 3,
        startDateTime: '2026-07-08T15:59:00Z',
        timeZone,
      }),
    ).toEqual({
      startDateTime: '2026-07-11T15:59:00Z',
    });
  });

  it('preserves the local time across DST', () => {
    expect(
      getShiftedRecordCalendarDateTime({
        dayOffset: 1,
        startDateTime: '2026-03-28T09:00:00Z',
        timeZone,
      }),
    ).toEqual({
      startDateTime: '2026-03-29T08:00:00Z',
    });
  });

  it('preserves the later offset when the source start is a repeated DST time', () => {
    expect(
      getShiftedRecordCalendarDateTime({
        dayOffset: 1,
        startDateTime: '2026-10-25T01:30:00Z',
        timeZone,
      }),
    ).toEqual({
      startDateTime: '2026-10-26T01:30:00Z',
    });
  });

  it('returns null for an unusable start', () => {
    expect(
      getShiftedRecordCalendarDateTime({
        dayOffset: 1,
        startDateTime: undefined,
        timeZone,
      }),
    ).toBeNull();
  });
});
