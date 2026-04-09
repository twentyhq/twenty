import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, type RelativeDateFilter } from 'twenty-shared/utils';

export const stringifyRelativeDateFilter = (
  relativeDateFilter: RelativeDateFilter,
) => {
  let relativeDateFilterStringified = `${relativeDateFilter.direction}_${relativeDateFilter.amount?.toString() ?? '1'}_${relativeDateFilter.unit}`;

  if (relativeDateFilter.direction === 'THIS') {
    relativeDateFilterStringified = `THIS_1_${relativeDateFilter.unit}`;
  } else if (
    !isDefined(relativeDateFilter.amount) ||
    relativeDateFilter.amount <= 0
  ) {
    throw new Error(
      'Amount must be defined and greater than 0 for relative date filters',
    );
  }

  if (isNonEmptyString(relativeDateFilter.timezone)) {
    relativeDateFilterStringified = `${relativeDateFilterStringified};;${relativeDateFilter.timezone};;`;

    const firstDayOfTheWeek =
      relativeDateFilter.firstDayOfTheWeek ?? detectCalendarStartDay();

    if (isNonEmptyString(firstDayOfTheWeek)) {
      relativeDateFilterStringified = `${relativeDateFilterStringified}${firstDayOfTheWeek};;`;
    }
  }

  return relativeDateFilterStringified;
};
