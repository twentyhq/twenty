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

// Secondary records in a multi drag keep their own time and move by the same
// displacement as the dragged record, unlike the dragged record which snaps to
// the destination slot. The displacement is applied as a timezone-local day
// offset plus an intra-day time offset so the displayed relative layout is
// preserved across DST transitions, rather than as an absolute instant delta.
export const getShiftedRecordCalendarWeekEventUpdateInput = ({
  record,
  calendarFieldName,
  calendarEndFieldName,
  dayOffset,
  timeOfDayDeltaNanoseconds,
  timeZone,
}: GetShiftedRecordCalendarWeekEventUpdateInputArgs): Partial<ObjectRecord> | null => {
  const startDateTime = record[calendarFieldName];

  if (typeof startDateTime !== 'string') {
    return null;
  }

  try {
    const originalStartInstant = Temporal.Instant.from(startDateTime);

    const shiftedStartInstant = Temporal.Instant.fromEpochNanoseconds(
      originalStartInstant.toZonedDateTimeISO(timeZone).add({ days: dayOffset })
        .epochNanoseconds + timeOfDayDeltaNanoseconds,
    );

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
