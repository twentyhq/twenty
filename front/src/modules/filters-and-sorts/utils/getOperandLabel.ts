import { EntityFilterOperand } from '../types/EntityFilterOperand';

export function getOperandLabel(
  operand: EntityFilterOperand | null | undefined,
) {
  switch (operand) {
    case 'contains':
      return 'Contains';
    case 'does-not-contain':
      return "Does'nt contain";
    case 'greater-than':
      return 'Greater than';
    case 'less-than':
      return 'Less than';
    case 'is':
      return 'Is';
    case 'is-not':
      return 'Is not';
    default:
      return '';
  }
}
