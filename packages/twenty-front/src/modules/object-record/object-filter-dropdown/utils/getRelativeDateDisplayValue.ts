import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/utils/view-filter-value/resolveDateViewFilterValue';
import { capitalize } from '~/utils/string/capitalize';

export const getRelativeDateDisplayValue = (
  relativeDate: {
    direction: VariableDateViewFilterValueDirection;
    amount: number;
    unit: VariableDateViewFilterValueUnit;
  } | null,
) => {
  if (!relativeDate) return '';

  const isPlural = relativeDate.amount > 1;
  return capitalize(
    `${relativeDate.direction} ${relativeDate.amount} ${relativeDate.unit}${isPlural ? 's' : ''}`.toLowerCase(),
  );
};
