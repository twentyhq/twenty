import { isNonEmptyString } from '@sniptt/guards';
import { type RelativeDateFilter } from 'twenty-shared/utils';

export const computeVariableDateViewFilterValue = (
  relativeDateFilter: RelativeDateFilter,
) => {
  let relativeFilterValue = `${relativeDateFilter.direction}_${relativeDateFilter.amount?.toString() ?? '1'}_${relativeDateFilter.unit}`;

  if (relativeDateFilter.direction === 'THIS') {
    relativeFilterValue = `THIS_1_${relativeDateFilter.unit}`;
  } else if (
    relativeDateFilter.amount === undefined ||
    relativeDateFilter.amount <= 0
  ) {
    throw new Error(
      'Amount must be defined and greater than 0 for relative date filters',
    );
  }

  if (isNonEmptyString(relativeDateFilter.timezone)) {
    relativeFilterValue = `${relativeFilterValue}_${relativeDateFilter.timezone}`;

    if (isNonEmptyString(relativeDateFilter.referenceDayAsString)) {
      relativeFilterValue = `${relativeFilterValue}_${relativeDateFilter.referenceDayAsString}`;

      if (isNonEmptyString(relativeDateFilter.firstDayOfTheWeek)) {
        relativeFilterValue = `${relativeFilterValue}_${relativeDateFilter.firstDayOfTheWeek}`;
      }
    }
  }

  return relativeFilterValue;
};
