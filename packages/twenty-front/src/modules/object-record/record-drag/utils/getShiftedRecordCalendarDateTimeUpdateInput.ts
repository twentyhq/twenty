import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getShiftedRecordCalendarDateTime } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDateTime';

type GetShiftedRecordCalendarDateTimeUpdateInputArgs = {
  record: ObjectRecord;
  startFieldName: string;
  dayOffset: number;
  timeZone: string;
  fallbackStartDateTime: string;
};

export const getShiftedRecordCalendarDateTimeUpdateInput = ({
  record,
  startFieldName,
  dayOffset,
  timeZone,
  fallbackStartDateTime,
}: GetShiftedRecordCalendarDateTimeUpdateInputArgs): Partial<ObjectRecord> => {
  const shiftedDateTime = getShiftedRecordCalendarDateTime({
    dayOffset,
    startDateTime: record[startFieldName],
    timeZone,
  });

  return {
    [startFieldName]: shiftedDateTime?.startDateTime ?? fallbackStartDateTime,
  };
};
