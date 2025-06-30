import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/view-filter-value/utils/resolveDateViewFilterValue';

export const computeVariableDateViewFilterValue = (
  direction: VariableDateViewFilterValueDirection,
  amount: number | undefined,
  unit: VariableDateViewFilterValueUnit,
) => {
  if (direction === 'THIS') {
    return `THIS_1_${unit}`;
  } else if (amount === undefined || amount <= 0) {
    throw new Error(
      'Amount must be defined and greater than 0 for relative date filters',
    );
  }

  return `${direction}_${amount.toString()}_${unit}`;
};
