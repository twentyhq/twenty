import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getShiftedRecordCalendarDate } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDate';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

type GetShiftedRecordCalendarDateUpdateInputArgs = {
  record: ObjectRecord;
  calendarFieldName: string;
  calendarEndFieldName?: string;
  dayOffset: number;
  fallbackStartDate: string;
};

export const getShiftedRecordCalendarDateUpdateInput = ({
  record,
  calendarFieldName,
  calendarEndFieldName,
  dayOffset,
  fallbackStartDate,
}: GetShiftedRecordCalendarDateUpdateInputArgs): Partial<ObjectRecord> | null => {
  const startDate = record[calendarFieldName] as string | undefined;

  if (!isDefined(startDate)) {
    return null;
  }

  const currentStartDate = Temporal.PlainDate.from(startDate);

  const shiftedDate = getShiftedRecordCalendarDate({
    currentStartDate,
    dayOffset,
    startDate,
    endDate: isDefined(calendarEndFieldName)
      ? record[calendarEndFieldName]
      : undefined,
  });

  return {
    [calendarFieldName]: shiftedDate?.startDate ?? fallbackStartDate,
    ...(isDefined(calendarEndFieldName) &&
      isDefined(shiftedDate?.endDate) && {
        [calendarEndFieldName]: shiftedDate.endDate,
      }),
  };
};
