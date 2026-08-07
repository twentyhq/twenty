import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getShiftedRecordCalendarDateTimeUpdateInput } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDateTimeUpdateInput';

const timeZone = 'Europe/Paris';
const fallbackStartDateTime = '2026-07-20T00:00:00Z';

const buildRecord = (fields: Record<string, unknown>): ObjectRecord =>
  ({
    id: 'record-id',
    __typename: 'Record',
    ...fields,
  }) as ObjectRecord;

describe('getShiftedRecordCalendarDateTimeUpdateInput', () => {
  it('shifts the start date-time by the day offset', () => {
    expect(
      getShiftedRecordCalendarDateTimeUpdateInput({
        record: buildRecord({ startAt: '2026-07-08T15:59:00Z' }),
        calendarFieldName: 'startAt',
        dayOffset: 3,
        timeZone,
        fallbackStartDateTime,
      }),
    ).toEqual({ startAt: '2026-07-11T15:59:00Z' });
  });

  it('shifts both the start and end date-times when an end field is given', () => {
    expect(
      getShiftedRecordCalendarDateTimeUpdateInput({
        record: buildRecord({
          startAt: '2026-07-08T15:59:00Z',
          endAt: '2026-07-10T18:59:00Z',
        }),
        calendarFieldName: 'startAt',
        calendarEndFieldName: 'endAt',
        dayOffset: 1,
        timeZone,
        fallbackStartDateTime,
      }),
    ).toEqual({
      startAt: '2026-07-09T15:59:00Z',
      endAt: '2026-07-11T18:59:00Z',
    });
  });

  it('falls back to the destination date-time when the start is missing', () => {
    expect(
      getShiftedRecordCalendarDateTimeUpdateInput({
        record: buildRecord({}),
        calendarFieldName: 'startAt',
        dayOffset: 1,
        timeZone,
        fallbackStartDateTime,
      }),
    ).toEqual({ startAt: fallbackStartDateTime });
  });

  it('falls back without an end when the stored start is malformed', () => {
    expect(
      getShiftedRecordCalendarDateTimeUpdateInput({
        record: buildRecord({
          startAt: 'not-a-date',
          endAt: '2026-07-10T18:59:00Z',
        }),
        calendarFieldName: 'startAt',
        calendarEndFieldName: 'endAt',
        dayOffset: 1,
        timeZone,
        fallbackStartDateTime,
      }),
    ).toEqual({ startAt: fallbackStartDateTime });
  });

  it('omits the end when it precedes the start', () => {
    expect(
      getShiftedRecordCalendarDateTimeUpdateInput({
        record: buildRecord({
          startAt: '2026-07-08T15:59:00Z',
          endAt: '2026-07-07T18:59:00Z',
        }),
        calendarFieldName: 'startAt',
        calendarEndFieldName: 'endAt',
        dayOffset: 1,
        timeZone,
        fallbackStartDateTime,
      }),
    ).toEqual({ startAt: '2026-07-09T15:59:00Z' });
  });
});
