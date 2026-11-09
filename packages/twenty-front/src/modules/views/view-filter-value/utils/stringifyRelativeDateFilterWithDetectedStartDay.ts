import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  type RelativeDateFilter,
  stringifyRelativeDateFilter,
} from 'twenty-shared/utils';

export const stringifyRelativeDateFilterWithDetectedStartDay = (
  relativeDateFilter: RelativeDateFilter,
) =>
  stringifyRelativeDateFilter(
    isNonEmptyString(relativeDateFilter.timezone) &&
      !isDefined(relativeDateFilter.firstDayOfTheWeek)
      ? { ...relativeDateFilter, firstDayOfTheWeek: detectCalendarStartDay() }
      : relativeDateFilter,
  );
