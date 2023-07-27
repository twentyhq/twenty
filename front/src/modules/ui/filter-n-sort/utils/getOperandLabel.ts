import { FilterOperand } from '../types/FilterOperand';

export function getOperandLabel(operand: FilterOperand | null | undefined) {
  switch (operand) {
    case 'contains':
      return 'Contains';
    case 'does-not-contain':
      return "Doesn't contain";
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
export function getOperandLabelShort(
  operand: FilterOperand | null | undefined,
) {
  switch (operand) {
    case 'is':
    case 'contains':
      return ': ';
    case 'is-not':
    case 'does-not-contain':
      return ': Not';
    case 'greater-than':
      return '\u00A0> ';
    case 'less-than':
      return '\u00A0< ';
    default:
      return ': ';
  }
}
