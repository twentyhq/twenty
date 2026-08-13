import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getShiftedRecordCalendarWeekEventUpdateInput } from '@/object-record/record-calendar/week/utils/getShiftedRecordCalendarWeekEventUpdateInput';

const timeZone = 'Europe/Paris';

const buildRecord = (fields: Record<string, unknown>): ObjectRecord =>
  ({
    id: 'record-id',
    __typename: 'Record',
    ...fields,
  }) as ObjectRecord;

describe('getShiftedRecordCalendarWeekEventUpdateInput', () => {
  it('moves the start by the day offset while keeping the local time', () => {
    expect(
      getShiftedRecordCalendarWeekEventUpdateInput({
        record: buildRecord({ startAt: '2026-07-08T15:59:00Z' }),
        calendarFieldName: 'startAt',
        dayOffset: 1,
        timeOfDayDeltaNanoseconds: 0n,
        timeZone,
      }),
    ).toEqual({ startAt: '2026-07-09T15:59:00Z' });
  });

  it('applies the time-of-day delta on top of the day offset', () => {
    expect(
      getShiftedRecordCalendarWeekEventUpdateInput({
        record: buildRecord({ startAt: '2026-07-08T15:59:00Z' }),
        calendarFieldName: 'startAt',
        dayOffset: 1,
        timeOfDayDeltaNanoseconds: 3_600_000_000_000n,
        timeZone,
      }),
    ).toEqual({ startAt: '2026-07-09T16:59:00Z' });
  });

  it('shifts the end and preserves the duration', () => {
    expect(
      getShiftedRecordCalendarWeekEventUpdateInput({
        record: buildRecord({
          startAt: '2026-07-08T15:59:00Z',
          endAt: '2026-07-10T18:59:00Z',
        }),
        calendarFieldName: 'startAt',
        calendarEndFieldName: 'endAt',
        dayOffset: 1,
        timeOfDayDeltaNanoseconds: 0n,
        timeZone,
      }),
    ).toEqual({
      startAt: '2026-07-09T15:59:00Z',
      endAt: '2026-07-11T18:59:00Z',
    });
  });

  it('omits the end when it precedes the start', () => {
    expect(
      getShiftedRecordCalendarWeekEventUpdateInput({
        record: buildRecord({
          startAt: '2026-07-08T15:59:00Z',
          endAt: '2026-07-07T18:59:00Z',
        }),
        calendarFieldName: 'startAt',
        calendarEndFieldName: 'endAt',
        dayOffset: 1,
        timeOfDayDeltaNanoseconds: 0n,
        timeZone,
      }),
    ).toEqual({ startAt: '2026-07-09T15:59:00Z' });
  });

  it('returns null when the stored start is missing', () => {
    expect(
      getShiftedRecordCalendarWeekEventUpdateInput({
        record: buildRecord({}),
        calendarFieldName: 'startAt',
        dayOffset: 1,
        timeOfDayDeltaNanoseconds: 0n,
        timeZone,
      }),
    ).toBeNull();
  });

  it('returns null when the stored start is malformed', () => {
    expect(
      getShiftedRecordCalendarWeekEventUpdateInput({
        record: buildRecord({ startAt: 'not-a-date' }),
        calendarFieldName: 'startAt',
        dayOffset: 1,
        timeOfDayDeltaNanoseconds: 0n,
        timeZone,
      }),
    ).toBeNull();
  });
});
