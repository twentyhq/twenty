import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  type RecordCalendarTimelineDayGroup,
  type RecordCalendarTimelineMonthGroup,
} from '@/object-record/record-calendar/timeline/types/RecordCalendarTimelineGroup';
import { Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type GetRecordCalendarTimelineGroupsArgs = {
  calendarFieldName: string;
  calendarFieldType: FieldMetadataType;
  records: ObjectRecord[];
  selectedDate: Temporal.PlainDate;
  timeZone: string;
};

type TimelineRecord = {
  day: Temporal.PlainDate;
  recordId: string;
  sortValue: number;
};

const getTimelineRecord = ({
  calendarFieldName,
  calendarFieldType,
  record,
  timeZone,
}: Pick<
  GetRecordCalendarTimelineGroupsArgs,
  'calendarFieldName' | 'calendarFieldType' | 'timeZone'
> & {
  record: ObjectRecord;
}): TimelineRecord | null => {
  const fieldValue = record[calendarFieldName];

  if (typeof fieldValue !== 'string') {
    return null;
  }

  try {
    if (calendarFieldType === FieldMetadataType.DATE) {
      const day = Temporal.PlainDate.from(fieldValue);

      return {
        day,
        recordId: record.id,
        sortValue: day.toZonedDateTime('UTC').epochMilliseconds,
      };
    }

    const instant = Temporal.Instant.from(fieldValue);

    return {
      day: instant.toZonedDateTimeISO(timeZone).toPlainDate(),
      recordId: record.id,
      sortValue: instant.epochMilliseconds,
    };
  } catch {
    return null;
  }
};

export const getRecordCalendarTimelineGroups = ({
  calendarFieldName,
  calendarFieldType,
  records,
  selectedDate,
  timeZone,
}: GetRecordCalendarTimelineGroupsArgs): RecordCalendarTimelineMonthGroup[] => {
  const firstDayOfRange = selectedDate.with({ day: 1 });
  const firstDayAfterRange = firstDayOfRange.add({ months: 4 });

  const timelineRecords = records
    .map((record) =>
      getTimelineRecord({
        calendarFieldName,
        calendarFieldType,
        record,
        timeZone,
      }),
    )
    .filter((record): record is TimelineRecord => record !== null)
    .filter(
      ({ day }) =>
        Temporal.PlainDate.compare(day, firstDayOfRange) >= 0 &&
        Temporal.PlainDate.compare(day, firstDayAfterRange) < 0,
    )
    .sort((recordA, recordB) => recordA.sortValue - recordB.sortValue);

  const monthGroups = new Map<
    string,
    Map<string, RecordCalendarTimelineDayGroup>
  >();

  for (const timelineRecord of timelineRecords) {
    const month = timelineRecord.day.toPlainYearMonth().toString();
    const day = timelineRecord.day.toString();
    const dayGroups = monthGroups.get(month) ?? new Map();
    const dayGroup = dayGroups.get(day) ?? { day, recordIds: [] };

    dayGroup.recordIds.push(timelineRecord.recordId);
    dayGroups.set(day, dayGroup);
    monthGroups.set(month, dayGroups);
  }

  return Array.from(monthGroups, ([month, dayGroups]) => ({
    month,
    days: Array.from(dayGroups.values()),
  }));
};
