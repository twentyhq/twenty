import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getShiftedRecordCalendarDate } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDate';

type GetShiftedRecordCalendarDateUpdateInputArgs = {
  record: ObjectRecord;
  calendarFieldName: string;
  dayOffset: number;
  fallbackStartDate: string;
};

export const getShiftedRecordCalendarDateUpdateInput = ({
  record,
  calendarFieldName,
  dayOffset,
  fallbackStartDate,
}: GetShiftedRecordCalendarDateUpdateInputArgs): Partial<ObjectRecord> => {
  const shiftedDate = getShiftedRecordCalendarDate({
    dayOffset,
    startDate: record[calendarFieldName],
  });

  return {
    [calendarFieldName]: shiftedDate?.startDate ?? fallbackStartDate,
  };
};
