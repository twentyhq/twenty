import { type Temporal } from 'temporal-polyfill';
import {
  isDefined,
  turnPlainDateToShiftedDateInSystemTimeZone,
} from 'twenty-shared/utils';

type RelativeDatePickerCalendarRange = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  rangeKey: string | undefined;
};

// Maps a resolved relative range (reduced to its first and last *plain*
// calendar days) to the props react-datepicker needs in range mode:
// system-timezone-shifted JS Dates, plus a remount key so the calendar
// re-opens on the range start whenever the resolved range changes. Shared by
// DatePicker and DateTimePicker, which only differ in how they derive the two
// plain dates from their stored value (string vs ZonedDateTime).
export const getRelativeDatePickerCalendarRange = (
  startPlainDate: Temporal.PlainDate | null,
  endInclusivePlainDate: Temporal.PlainDate | null,
): RelativeDatePickerCalendarRange => ({
  startDate: isDefined(startPlainDate)
    ? turnPlainDateToShiftedDateInSystemTimeZone(startPlainDate)
    : undefined,
  endDate: isDefined(endInclusivePlainDate)
    ? turnPlainDateToShiftedDateInSystemTimeZone(endInclusivePlainDate)
    : undefined,
  rangeKey:
    isDefined(startPlainDate) && isDefined(endInclusivePlainDate)
      ? `${startPlainDate.toString()}-${endInclusivePlainDate.toString()}`
      : undefined,
});
