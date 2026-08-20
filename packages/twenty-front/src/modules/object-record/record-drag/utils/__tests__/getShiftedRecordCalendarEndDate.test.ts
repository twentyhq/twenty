import { getShiftedRecordCalendarEndDate } from '@/object-record/record-drag/utils/getShiftedRecordCalendarEndDate';
import { Temporal } from 'temporal-polyfill';

const originalStartDate = Temporal.PlainDate.from('2026-07-08');

describe('getShiftedRecordCalendarEndDate', () => {
  it('shifts an end that is after the start by the day offset', () => {
    expect(
      getShiftedRecordCalendarEndDate({
        dayOffset: 1,
        endDate: '2026-07-10',
        originalStartDate,
      }),
    ).toBe('2026-07-11');
  });

  it('shifts an end that is equal to the start', () => {
    expect(
      getShiftedRecordCalendarEndDate({
        dayOffset: 1,
        endDate: '2026-07-08',
        originalStartDate,
      }),
    ).toBe('2026-07-09');
  });

  it('moves the end backwards for a negative offset', () => {
    expect(
      getShiftedRecordCalendarEndDate({
        dayOffset: -2,
        endDate: '2026-07-10',
        originalStartDate,
      }),
    ).toBe('2026-07-08');
  });

  it('returns undefined when the end precedes the start', () => {
    expect(
      getShiftedRecordCalendarEndDate({
        dayOffset: 1,
        endDate: '2026-07-05',
        originalStartDate,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for a malformed end', () => {
    expect(
      getShiftedRecordCalendarEndDate({
        dayOffset: 1,
        endDate: 'not-a-date',
        originalStartDate,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for a missing end', () => {
    expect(
      getShiftedRecordCalendarEndDate({
        dayOffset: 1,
        endDate: undefined,
        originalStartDate,
      }),
    ).toBeUndefined();
  });
});
