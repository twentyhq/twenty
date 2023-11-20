import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { FilterType } from '../types/FilterType';

export const getOperandsForFilterType = (
  filterType: FilterType | null | undefined,
): ViewFilterOperand[] => {
  switch (filterType) {
    case 'TEXT':
      return [ViewFilterOperand.Contains, ViewFilterOperand.DoesNotContain];
    case 'NUMBER':
    case 'DATE_TIME':
      return [ViewFilterOperand.GreaterThan, ViewFilterOperand.LessThan];
    case 'ENTITY':
      return [ViewFilterOperand.Is, ViewFilterOperand.IsNot];
    default:
      return [];
  }
};
