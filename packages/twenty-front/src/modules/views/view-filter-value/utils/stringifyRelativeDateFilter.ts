import { isNonEmptyString } from '@sniptt/guards';
import { type RelativeDateFilter } from 'twenty-shared/utils';

export const stringifyRelativeDateFilter = (
  relativeDateFilter: RelativeDateFilter,
) => {
  let relativeDateFilterStringified = `${relativeDateFilter.direction}_${relativeDateFilter.amount?.toString() ?? '1'}_${relativeDateFilter.unit}`;

  if (relativeDateFilter.direction === 'THIS') {
    relativeDateFilterStringified = `THIS_1_${relativeDateFilter.unit}`;
  } else if (
    relativeDateFilter.amount === undefined ||
    relativeDateFilter.amount <= 0
  ) {
    throw new Error(
      'Amount must be defined and greater than 0 for relative date filters',
    );
  }

  if (isNonEmptyString(relativeDateFilter.timezone)) {
    relativeDateFilterStringified = `${relativeDateFilterStringified}_${relativeDateFilter.timezone}`;

    if (isNonEmptyString(relativeDateFilter.referenceDayAsString)) {
      relativeDateFilterStringified = `${relativeDateFilterStringified}_${relativeDateFilter.referenceDayAsString}`;

      if (isNonEmptyString(relativeDateFilter.firstDayOfTheWeek)) {
        relativeDateFilterStringified = `${relativeDateFilterStringified}_${relativeDateFilter.firstDayOfTheWeek}`;
      }
    }
  }

  return relativeDateFilterStringified;
};
