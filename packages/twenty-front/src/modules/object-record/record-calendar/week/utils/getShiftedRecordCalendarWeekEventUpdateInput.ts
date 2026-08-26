import { getShiftedRecordCalendarEndDateTime } from '@/object-record/record-drag/utils/getShiftedRecordCalendarEndDateTime';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

type GetShiftedRecordCalendarWeekEventUpdateInputArgs = {
  record: ObjectRecord;
  calendarFieldName: string;
  calendarEndFieldName?: string;
  dayOffset: number;
  timeOfDayDeltaNanoseconds: bigint;
  timeZone: string;
};

export const getShiftedRecordCalendarWeekEventUpdateInput = ({
  record,
  calendarFieldName,
  calendarEndFieldName,
  dayOffset,
  timeOfDayDeltaNanoseconds,
  timeZone,
}: GetShiftedRecordCalendarWeekEventUpdateInputArgs): Partial<ObjectRecord> | null => {
  const startDateTime = record[calendarFieldName];

  try {
    const originalStartInstant = Temporal.Instant.from(startDateTime);

    const shiftedStartInstant = originalStartInstant
      .toZonedDateTimeISO(timeZone)
      .toPlainDateTime()
      .add({
        days: dayOffset,
        nanoseconds: Number(timeOfDayDeltaNanoseconds),
      })
      .toZonedDateTime(timeZone)
      .toInstant();

    const endDateTime = isDefined(calendarEndFieldName)
      ? record[calendarEndFieldName]
      : undefined;

    const shiftedEndDateTime = getShiftedRecordCalendarEndDateTime({
      endDateTime,
      originalStartInstant,
      shiftedStartInstant,
    });

    return {
      [calendarFieldName]: shiftedStartInstant.toString(),
      ...(isDefined(calendarEndFieldName) &&
        isDefined(shiftedEndDateTime) && {
          [calendarEndFieldName]: shiftedEndDateTime,
        }),
    };
  } catch {
    return null;
  }
};
