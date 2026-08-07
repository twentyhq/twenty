import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getShiftedRecordCalendarDateTime } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDateTime';
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

  const shiftedDateTime = getShiftedRecordCalendarDateTime({
    dayOffset,
    startDateTime,
    endDateTime: isDefined(calendarEndFieldName)
      ? record[calendarEndFieldName]
      : undefined,
    timeZone,
  });

  return {
    [calendarFieldName]:
      shiftedDateTime?.startDateTime ?? fallbackStartDateTime,
    ...(isDefined(calendarEndFieldName) &&
      isDefined(shiftedDateTime?.endDateTime) && {
        [calendarEndFieldName]: shiftedDateTime.endDateTime,
      }),
  };
};
