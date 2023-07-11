import { FilterOperand } from '../types/FilterOperand';
import { FilterType } from '../types/FilterType';

export function getOperandsForFilterType(
  filterType: FilterType | null | undefined,
): FilterOperand[] {
  switch (filterType) {
    case 'text':
      return ['contains', 'does-not-contain'];
    case 'number':
    case 'date':
      return ['greater-than', 'less-than'];
    case 'entity':
      return ['is', 'is-not'];
    default:
      return [];
  }
}
