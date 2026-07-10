import { getRecordCalendarDateRangeOverlapFilter } from '@/object-record/record-calendar/month/utils/getRecordCalendarDateRangeOverlapFilter';
import { FieldMetadataType } from 'twenty-shared/types';

describe('getRecordCalendarDateRangeOverlapFilter', () => {
  it('matches DATE ranges that overlap the visible range', () => {
    expect(
      getRecordCalendarDateRangeOverlapFilter({
        calendarField: {
          name: 'startDate',
          type: FieldMetadataType.DATE,
        },
        calendarEndField: {
          name: 'endDate',
          type: FieldMetadataType.DATE,
        },
        firstDayOfRange: '2026-06-29',
        nextDayAfterLastDayOfRange: '2026-08-10',
      }),
    ).toEqual({
      and: [
        {
          startDate: {
            lt: '2026-08-10',
          },
        },
        {
          or: [
            {
              startDate: {
                gte: '2026-06-29',
              },
            },
            {
              endDate: {
                gte: '2026-06-29',
              },
            },
          ],
        },
      ],
    });
  });

  it('does not replace the existing range filter when no end field is configured', () => {
    expect(
      getRecordCalendarDateRangeOverlapFilter({
        calendarField: {
          name: 'startDate',
          type: FieldMetadataType.DATE,
        },
        calendarEndField: undefined,
        firstDayOfRange: '2026-06-29',
        nextDayAfterLastDayOfRange: '2026-08-10',
      }),
    ).toBeUndefined();
  });

  it('does not replace the existing range filter for DATE_TIME fields', () => {
    expect(
      getRecordCalendarDateRangeOverlapFilter({
        calendarField: {
          name: 'startsAt',
          type: FieldMetadataType.DATE_TIME,
        },
        calendarEndField: {
          name: 'endsAt',
          type: FieldMetadataType.DATE_TIME,
        },
        firstDayOfRange: '2026-06-29',
        nextDayAfterLastDayOfRange: '2026-08-10',
      }),
    ).toBeUndefined();
  });
});
