import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

type GetShiftedRecordCalendarWeekEventUpdateInputArgs = {
  record: ObjectRecord;
  calendarFieldName: string;
  calendarEndFieldName?: string;
  deltaNanoseconds: bigint;
};

// Secondary records in a multi drag keep their own time and move by the same
// delta as the dragged record, unlike the dragged record which snaps to the
// destination slot.
export const getShiftedRecordCalendarWeekEventUpdateInput = ({
  record,
  calendarFieldName,
  calendarEndFieldName,
  deltaNanoseconds,
}: GetShiftedRecordCalendarWeekEventUpdateInputArgs): Partial<ObjectRecord> | null => {
  const startDateTime = record[calendarFieldName];

  if (typeof startDateTime !== 'string') {
    return null;
  }

  try {
    const shiftedStartInstant = Temporal.Instant.fromEpochNanoseconds(
      Temporal.Instant.from(startDateTime).epochNanoseconds + deltaNanoseconds,
    );

    const endDateTime = isDefined(calendarEndFieldName)
      ? record[calendarEndFieldName]
      : undefined;

    const shiftedEndDateTime =
      typeof endDateTime === 'string'
        ? Temporal.Instant.fromEpochNanoseconds(
            Temporal.Instant.from(endDateTime).epochNanoseconds +
              deltaNanoseconds,
          ).toString()
        : undefined;

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
