import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/utils/view-filter-value/resolveDateViewFilterValue';
import { plural } from 'pluralize';
import { capitalize } from '~/utils/string/capitalize';
export const getRelativeDateDisplayValue = (
  relativeDate: {
    direction: VariableDateViewFilterValueDirection;
    amount: number;
    unit: VariableDateViewFilterValueUnit;
  } | null,
) => {
  if (!relativeDate) return '';
  const { direction, amount, unit } = relativeDate;

  const directionStr = capitalize(direction.toLowerCase());
  const amountStr = direction === 'THIS' ? '' : amount;
  const unitStr = amount > 1 ? plural(unit.toLowerCase()) : unit.toLowerCase();

  return `${directionStr} ${amountStr} ${unitStr}`;
};
