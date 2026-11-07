import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  type RelativeDateFilter,
  stringifyRelativeDateFilter as stringifyRelativeDateFilterWithoutDetectedCalendarStartDay,
} from 'twenty-shared/utils';

export const stringifyRelativeDateFilter = (
  relativeDateFilter: RelativeDateFilter,
) =>
  stringifyRelativeDateFilterWithoutDetectedCalendarStartDay(
    isNonEmptyString(relativeDateFilter.timezone) &&
      !isDefined(relativeDateFilter.firstDayOfTheWeek)
      ? { ...relativeDateFilter, firstDayOfTheWeek: detectCalendarStartDay() }
      : relativeDateFilter,
  );
