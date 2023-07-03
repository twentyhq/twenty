import { TableFilterOperand } from '../types/TableFilterOperand';
import { TableFilterType } from '../types/TableFilterType';

export function getOperandsForFilterType(
  filterType: TableFilterType | null | undefined,
): TableFilterOperand[] {
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
