import { getRelativeDateFilterTimeZoneAbbreviation } from '@/object-record/object-filter-dropdown/utils/getRelativeDateFilterTimeZoneAbbreviation';
import { plural } from 'pluralize';

import {
  capitalize,
  isDefined,
  type RelativeDateFilter,
} from 'twenty-shared/utils';

export const getRelativeDateDisplayValue = (
  relativeDate: RelativeDateFilter,
  shouldDisplayTimeZoneAbbreviation?: boolean,
) => {
  if (!relativeDate) return '';
  const { direction, amount, unit } = relativeDate;

  const directionFormatted = capitalize(direction.toLowerCase());
  const amountFormatted = direction === 'THIS' ? '' : amount;
  let unitFormatted =
    direction === 'THIS'
      ? unit.toLowerCase()
      : amount
        ? amount > 1
          ? plural(unit.toLowerCase())
          : unit.toLowerCase()
        : undefined;

  if (isDefined(relativeDate.timezone)) {
    const timeZoneAbbreviation =
      getRelativeDateFilterTimeZoneAbbreviation(relativeDate);

    unitFormatted = `${unitFormatted ?? ''} ${shouldDisplayTimeZoneAbbreviation ? `(${timeZoneAbbreviation})` : ''}`;
  }

  return [directionFormatted, amountFormatted, unitFormatted]
    .filter((item) => item !== undefined)
    .join(' ');
};
