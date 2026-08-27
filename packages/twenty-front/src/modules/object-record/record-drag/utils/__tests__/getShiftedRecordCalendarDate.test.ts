import { getShiftedRecordCalendarDate } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDate';

describe('getShiftedRecordCalendarDate', () => {
  it('moves a date by the day offset', () => {
    expect(
      getShiftedRecordCalendarDate({
        dayOffset: 3,
        startDate: '2026-07-08',
      }),
    ).toEqual({
      startDate: '2026-07-11',
    });
  });

  it('moves the start backwards for a negative offset', () => {
    expect(
      getShiftedRecordCalendarDate({
        dayOffset: -2,
        startDate: '2026-07-08',
      }),
    ).toEqual({
      startDate: '2026-07-06',
    });
  });

  it('returns null for a missing start', () => {
    expect(
      getShiftedRecordCalendarDate({
        dayOffset: 1,
        startDate: undefined,
      }),
    ).toBeNull();
  });

  it('returns null for a malformed start instead of throwing', () => {
    expect(
      getShiftedRecordCalendarDate({
        dayOffset: 1,
        startDate: 'not-a-date',
      }),
    ).toBeNull();
  });
});
