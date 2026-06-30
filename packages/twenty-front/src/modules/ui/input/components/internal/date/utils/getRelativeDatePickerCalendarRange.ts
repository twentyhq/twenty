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
