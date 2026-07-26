import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  getShiftedRecordCalendarDateTime,
  type ShiftedRecordCalendarDateTime,
} from '@/object-record/record-drag/utils/getShiftedRecordCalendarDateTime';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

type GetShiftedRecordCalendarDateTimeUpdateInputArgs = {
  record: ObjectRecord;
  calendarFieldName: string;
  calendarEndFieldName?: string;
  dayOffset: number;
  timeZone: string;
  fallbackStartDateTime: string;
};

export const getShiftedRecordCalendarDateTimeUpdateInput = ({
  record,
  calendarFieldName,
  calendarEndFieldName,
  dayOffset,
  timeZone,
  fallbackStartDateTime,
}: GetShiftedRecordCalendarDateTimeUpdateInputArgs): Partial<ObjectRecord> | null => {
  const startDateTime = record[calendarFieldName] as string | undefined;

  if (!isDefined(startDateTime)) {
    return { [calendarFieldName]: fallbackStartDateTime };
  }

  let shiftedDateTime: ShiftedRecordCalendarDateTime | null = null;
  try {
    const currentStartInstant = Temporal.Instant.from(startDateTime);

    shiftedDateTime = getShiftedRecordCalendarDateTime({
      currentStartInstant,
      dayOffset,
      startDateTime,
      endDateTime: isDefined(calendarEndFieldName)
        ? record[calendarEndFieldName]
        : undefined,
      timeZone,
    });
  } catch {
    shiftedDateTime = null;
  }

  return {
    [calendarFieldName]:
      shiftedDateTime?.startDateTime ?? fallbackStartDateTime,
    ...(isDefined(calendarEndFieldName) &&
      isDefined(shiftedDateTime?.endDateTime) && {
        [calendarEndFieldName]: shiftedDateTime.endDateTime,
      }),
  };
};
