import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/view-filter-value/utils/resolveDateViewFilterValue';
import { plural } from 'pluralize';
import { capitalize } from 'twenty-shared';
export const getRelativeDateDisplayValue = (
  relativeDate: {
    direction: VariableDateViewFilterValueDirection;
    amount?: number;
    unit: VariableDateViewFilterValueUnit;
  } | null,
) => {
  if (!relativeDate) return '';
  const { direction, amount, unit } = relativeDate;

  const directionStr = capitalize(direction.toLowerCase());
  const amountStr = direction === 'THIS' ? '' : amount;
  const unitStr = amount
    ? amount > 1
      ? plural(unit.toLowerCase())
      : unit.toLowerCase()
    : undefined;

  return [directionStr, amountStr, unitStr]
    .filter((item) => item !== undefined)
    .join(' ');
};
