import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getShiftedRecordCalendarDateUpdateInput } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDateUpdateInput';

const buildRecord = (fields: Record<string, unknown>): ObjectRecord =>
  ({
    id: 'record-id',
    __typename: 'Record',
    ...fields,
  }) as ObjectRecord;

describe('getShiftedRecordCalendarDateUpdateInput', () => {
  it('shifts the start date by the day offset', () => {
    expect(
      getShiftedRecordCalendarDateUpdateInput({
        record: buildRecord({ startDate: '2026-07-08' }),
        calendarFieldName: 'startDate',
        dayOffset: 3,
        fallbackStartDate: '2026-07-20',
      }),
    ).toEqual({ startDate: '2026-07-11' });
  });

  it('shifts both the start and end dates when an end field is given', () => {
    expect(
      getShiftedRecordCalendarDateUpdateInput({
        record: buildRecord({ startDate: '2026-07-08', endDate: '2026-07-10' }),
        calendarFieldName: 'startDate',
        calendarEndFieldName: 'endDate',
        dayOffset: 1,
        fallbackStartDate: '2026-07-20',
      }),
    ).toEqual({ startDate: '2026-07-09', endDate: '2026-07-11' });
  });

  it('falls back to the destination date when the start is missing', () => {
    expect(
      getShiftedRecordCalendarDateUpdateInput({
        record: buildRecord({}),
        calendarFieldName: 'startDate',
        dayOffset: 1,
        fallbackStartDate: '2026-07-20',
      }),
    ).toEqual({ startDate: '2026-07-20' });
  });

  it('falls back without an end when the stored start is malformed', () => {
    expect(
      getShiftedRecordCalendarDateUpdateInput({
        record: buildRecord({ startDate: 'not-a-date', endDate: '2026-07-10' }),
        calendarFieldName: 'startDate',
        calendarEndFieldName: 'endDate',
        dayOffset: 1,
        fallbackStartDate: '2026-07-20',
      }),
    ).toEqual({ startDate: '2026-07-20' });
  });

  it('omits the end when it precedes the start', () => {
    expect(
      getShiftedRecordCalendarDateUpdateInput({
        record: buildRecord({ startDate: '2026-07-08', endDate: '2026-07-05' }),
        calendarFieldName: 'startDate',
        calendarEndFieldName: 'endDate',
        dayOffset: 1,
        fallbackStartDate: '2026-07-20',
      }),
    ).toEqual({ startDate: '2026-07-09' });
  });
});
