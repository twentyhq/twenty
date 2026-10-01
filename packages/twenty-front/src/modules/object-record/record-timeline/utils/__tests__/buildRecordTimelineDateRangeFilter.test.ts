import { buildRecordTimelineDateRangeFilter } from '@/object-record/record-timeline/utils/buildRecordTimelineDateRangeFilter';
import { Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const windowFirstDay = Temporal.PlainDate.from('2026-10-01');
const windowLastDay = Temporal.PlainDate.from('2026-10-31');

describe('buildRecordTimelineDateRangeFilter', () => {
  it('keeps records starting inside the window when there is no end field', () => {
    expect(
      buildRecordTimelineDateRangeFilter({
        startFieldMetadataItem: {
          name: 'startsOn',
          type: FieldMetadataType.DATE,
        },
        endFieldMetadataItem: undefined,
        windowFirstDay,
        windowLastDay,
        timeZone: 'UTC',
      }),
    ).toEqual({
      and: [
        { startsOn: { lt: '2026-11-01' } },
        { startsOn: { gte: '2026-10-01' } },
      ],
    });
  });

  it('keeps records overlapping the window when there is an end field', () => {
    expect(
      buildRecordTimelineDateRangeFilter({
        startFieldMetadataItem: {
          name: 'startsOn',
          type: FieldMetadataType.DATE,
        },
        endFieldMetadataItem: { name: 'endsOn', type: FieldMetadataType.DATE },
        windowFirstDay,
        windowLastDay,
        timeZone: 'UTC',
      }),
    ).toEqual({
      and: [
        { startsOn: { lt: '2026-11-01' } },
        {
          or: [
            { startsOn: { gte: '2026-10-01' } },
            { endsOn: { gte: '2026-10-01' } },
          ],
        },
      ],
    });
  });

  it('converts window bounds to instants in the user time zone for date time fields', () => {
    expect(
      buildRecordTimelineDateRangeFilter({
        startFieldMetadataItem: {
          name: 'startsAt',
          type: FieldMetadataType.DATE_TIME,
        },
        endFieldMetadataItem: undefined,
        windowFirstDay,
        windowLastDay,
        timeZone: 'Europe/Paris',
      }),
    ).toEqual({
      and: [
        { startsAt: { lt: '2026-10-31T23:00:00Z' } },
        { startsAt: { gte: '2026-09-30T22:00:00Z' } },
      ],
    });
  });
});
