import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/utils/view-filter-value/resolveDateViewFilterValue';

export const computeVariableDateViewFilterValue = (
  direction: VariableDateViewFilterValueDirection,
  amount: number | undefined,
  unit: VariableDateViewFilterValueUnit,
) => `${direction}_${amount?.toString()}_${unit}`;
