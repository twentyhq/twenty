import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getShiftedRecordCalendarDateTime } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDateTime';

type GetShiftedRecordCalendarDateTimeUpdateInputArgs = {
  record: ObjectRecord;
  calendarFieldName: string;
  dayOffset: number;
  timeZone: string;
  fallbackStartDateTime: string;
};

export const getShiftedRecordCalendarDateTimeUpdateInput = ({
  record,
  calendarFieldName,
  dayOffset,
  timeZone,
  fallbackStartDateTime,
}: GetShiftedRecordCalendarDateTimeUpdateInputArgs): Partial<ObjectRecord> => {
  const shiftedDateTime = getShiftedRecordCalendarDateTime({
    dayOffset,
    startDateTime: record[calendarFieldName],
    timeZone,
  });

  return {
    [calendarFieldName]:
      shiftedDateTime?.startDateTime ?? fallbackStartDateTime,
  };
};
