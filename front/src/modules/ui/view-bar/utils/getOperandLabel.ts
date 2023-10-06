import { FilterOperand } from '../types/FilterOperand';

export const getOperandLabel = (operand: FilterOperand | null | undefined) => {
  switch (operand) {
    case FilterOperand.Contains:
      return 'Contains';
    case FilterOperand.DoesNotContain:
      return "Doesn't contain";
    case FilterOperand.GreaterThan:
      return 'Greater than';
    case FilterOperand.LessThan:
      return 'Less than';
    case FilterOperand.Is:
      return 'Is';
    case FilterOperand.IsNot:
      return 'Is not';
    case FilterOperand.IsNotNull:
      return 'Is not null';
    default:
      return '';
  }
};

export const getOperandLabelShort = (
  operand: FilterOperand | null | undefined,
) => {
  switch (operand) {
    case FilterOperand.Is:
    case FilterOperand.Contains:
      return ': ';
    case FilterOperand.IsNot:
    case FilterOperand.DoesNotContain:
      return ': Not';
    case FilterOperand.IsNotNull:
      return ': NotNull';
    case FilterOperand.GreaterThan:
      return '\u00A0> ';
    case FilterOperand.LessThan:
      return '\u00A0< ';
    default:
      return ': ';
  }
};
