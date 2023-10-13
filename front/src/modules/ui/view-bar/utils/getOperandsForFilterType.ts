import { ViewFilterOperand } from '~/generated/graphql';

import { FilterType } from '../types/FilterType';

export const getOperandsForFilterType = (
  filterType: FilterType | null | undefined,
): ViewFilterOperand[] => {
  switch (filterType) {
    case 'text':
      return [ViewFilterOperand.Contains, ViewFilterOperand.DoesNotContain];
    case 'number':
    case 'date':
      return [ViewFilterOperand.GreaterThan, ViewFilterOperand.LessThan];
    case 'entity':
      return [ViewFilterOperand.Is, ViewFilterOperand.IsNot];
    default:
      return [];
  }
};
