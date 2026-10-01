import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getShiftedRecordCalendarDate } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDate';

type GetShiftedRecordCalendarDateUpdateInputArgs = {
  record: ObjectRecord;
  startFieldName: string;
  dayOffset: number;
  fallbackStartDate: string;
};

export const getShiftedRecordCalendarDateUpdateInput = ({
  record,
  startFieldName,
  dayOffset,
  fallbackStartDate,
}: GetShiftedRecordCalendarDateUpdateInputArgs): Partial<ObjectRecord> => {
  const shiftedDate = getShiftedRecordCalendarDate({
    dayOffset,
    startDate: record[startFieldName],
  });

  return {
    [startFieldName]: shiftedDate?.startDate ?? fallbackStartDate,
  };
};
