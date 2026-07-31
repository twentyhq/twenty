import { getRecordCalendarTimelineGroups } from '@/object-record/record-calendar/timeline/utils/getRecordCalendarTimelineGroups';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const record = (id: string, startsAt: string): ObjectRecord =>
  ({ __typename: 'Opportunity', id, startsAt }) as ObjectRecord;

describe('getRecordCalendarTimelineGroups', () => {
  it('sorts and groups date records across the four-month timeline range', () => {
    const groups = getRecordCalendarTimelineGroups({
      calendarFieldName: 'startsAt',
      calendarFieldType: FieldMetadataType.DATE,
      records: [
        record('april', '2025-04-02'),
        record('before-range', '2025-02-28'),
        record('march', '2025-03-20'),
        record('after-range', '2025-07-01'),
      ],
      selectedDate: Temporal.PlainDate.from('2025-03-15'),
      timeZone: 'Europe/Paris',
    });

    expect(groups).toEqual([
      {
        month: '2025-03',
        days: [{ day: '2025-03-20', recordIds: ['march'] }],
      },
      {
        month: '2025-04',
        days: [{ day: '2025-04-02', recordIds: ['april'] }],
      },
    ]);
  });

  it('groups date-time records by their day in the user time zone', () => {
    const groups = getRecordCalendarTimelineGroups({
      calendarFieldName: 'startsAt',
      calendarFieldType: FieldMetadataType.DATE_TIME,
      records: [
        record('april-in-paris', '2025-03-31T22:30:00Z'),
        record('march-in-paris', '2025-03-31T21:30:00Z'),
      ],
      selectedDate: Temporal.PlainDate.from('2025-03-15'),
      timeZone: 'Europe/Paris',
    });

    expect(groups).toEqual([
      {
        month: '2025-03',
        days: [{ day: '2025-03-31', recordIds: ['march-in-paris'] }],
      },
      {
        month: '2025-04',
        days: [{ day: '2025-04-01', recordIds: ['april-in-paris'] }],
      },
    ]);
  });
});
