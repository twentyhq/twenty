import { FilterOperand } from '../types/FilterOperand';
import { FilterType } from '../types/FilterType';

export function getOperandsForFilterType(
  filterType: FilterType | null | undefined,
): FilterOperand[] {
  switch (filterType) {
    case 'text':
      return [FilterOperand.Contains, FilterOperand.DoesNotContain];
    case 'number':
    case 'date':
      return [FilterOperand.GreaterThan, FilterOperand.LessThan];
    case 'entity':
      return [FilterOperand.Is, FilterOperand.IsNot];
    default:
      return [];
  }
}
