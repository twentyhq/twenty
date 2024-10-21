import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/view-filter-value/utils/resolveDateViewFilterValue';

export const computeVariableDateViewFilterValue = (
  direction: VariableDateViewFilterValueDirection,
  amount: number | undefined,
  unit: VariableDateViewFilterValueUnit,
) => `${direction}_${amount?.toString()}_${unit}`;
