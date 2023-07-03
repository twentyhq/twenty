import { EntityFilterOperand } from '../types/EntityFilterOperand';
import { EntityFilterType } from '../types/EntityFilterType';

export function getOperandsForFilterType(
  filterType: EntityFilterType | null | undefined,
): EntityFilterOperand[] {
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
