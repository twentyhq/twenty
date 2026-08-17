import { getShiftedRecordCalendarDate } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDate';

describe('getShiftedRecordCalendarDate', () => {
  it('moves a dated event by the day offset and preserves duration', () => {
    expect(
      getShiftedRecordCalendarDate({
        dayOffset: 3,
        startDate: '2026-07-08',
        endDate: '2026-07-10',
      }),
    ).toEqual({
      startDate: '2026-07-11',
      endDate: '2026-07-13',
    });
  });

  it('moves the start backwards for a negative offset', () => {
    expect(
      getShiftedRecordCalendarDate({
        dayOffset: -2,
        startDate: '2026-07-08',
        endDate: '2026-07-10',
      }),
    ).toEqual({
      startDate: '2026-07-06',
      endDate: '2026-07-08',
    });
  });

  it('shifts an end that is equal to the start', () => {
    expect(
      getShiftedRecordCalendarDate({
        dayOffset: 1,
        startDate: '2026-07-08',
        endDate: '2026-07-08',
      }),
    ).toEqual({
      startDate: '2026-07-09',
      endDate: '2026-07-09',
    });
  });

  it('does not synthesize an end when it is malformed', () => {
    expect(
      getShiftedRecordCalendarDate({
        dayOffset: 1,
        startDate: '2026-07-08',
        endDate: 'not-a-date',
      }),
    ).toEqual({
      startDate: '2026-07-09',
    });
  });

  it('drops an end that precedes the start', () => {
    expect(
      getShiftedRecordCalendarDate({
        dayOffset: 1,
        startDate: '2026-07-08',
        endDate: '2026-07-05',
      }),
    ).toEqual({
      startDate: '2026-07-09',
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
        endDate: '2026-07-10',
      }),
    ).toBeNull();
  });
});
