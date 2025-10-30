import { plural } from 'pluralize';

import {
  capitalize,
  type RelativeDateFilterDirection,
  type RelativeDateFilterUnit,
} from 'twenty-shared/utils';

export const getRelativeDateDisplayValue = (
  relativeDate: {
    direction: RelativeDateFilterDirection;
    amount?: number;
    unit: RelativeDateFilterUnit;
  } | null,
) => {
  if (!relativeDate) return '';
  const { direction, amount, unit } = relativeDate;

  const directionStr = capitalize(direction.toLowerCase());
  const amountStr = direction === 'THIS' ? '' : amount;
  const unitStr =
    direction === 'THIS'
      ? unit.toLowerCase()
      : amount
        ? amount > 1
          ? plural(unit.toLowerCase())
          : unit.toLowerCase()
        : undefined;

  return [directionStr, amountStr, unitStr]
    .filter((item) => item !== undefined)
    .join(' ');
};
