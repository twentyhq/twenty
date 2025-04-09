import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { t } from '@lingui/core/macro';

export const getOperandLabel = (
  operand: ViewFilterOperand | null | undefined,
) => {
  switch (operand) {
    case ViewFilterOperand.Contains:
      return t`Contains`;
    case ViewFilterOperand.DoesNotContain:
      return t`Doesn't contain`;
    case ViewFilterOperand.GreaterThan:
      return t`Greater than`;
    case ViewFilterOperand.LessThan:
      return t`Less than`;
    case ViewFilterOperand.IsBefore:
      return t`Is before`;
    case ViewFilterOperand.IsAfter:
      return t`Is after`;
    case ViewFilterOperand.Is:
      return t`Is`;
    case ViewFilterOperand.IsNot:
      return t`Is not`;
    case ViewFilterOperand.IsNotNull:
      return t`Is not null`;
    case ViewFilterOperand.IsEmpty:
      return t`Is empty`;
    case ViewFilterOperand.IsNotEmpty:
      return t`Is not empty`;
    case ViewFilterOperand.IsRelative:
      return t`Is relative`;
    case ViewFilterOperand.IsInPast:
      return t`Is in past`;
    case ViewFilterOperand.IsInFuture:
      return t`Is in future`;
    case ViewFilterOperand.IsToday:
      return t`Is today`;
    default:
      return '';
  }
};

export const getOperandLabelShort = (
  operand: ViewFilterOperand | null | undefined,
) => {
  switch (operand) {
    case ViewFilterOperand.Is:
    case ViewFilterOperand.Contains:
      return ': ';
    case ViewFilterOperand.IsNot:
    case ViewFilterOperand.DoesNotContain:
      return t`: Not`;
    case ViewFilterOperand.IsNotNull:
      return t`: NotNull`;
    case ViewFilterOperand.IsNotEmpty:
      return t`: NotEmpty`;
    case ViewFilterOperand.IsEmpty:
      return t`: Empty`;
    case ViewFilterOperand.GreaterThan:
      return '\u00A0> ';
    case ViewFilterOperand.LessThan:
      return '\u00A0< ';
    case ViewFilterOperand.IsBefore:
      return '\u00A0< ';
    case ViewFilterOperand.IsAfter:
      return '\u00A0> ';
    case ViewFilterOperand.IsInPast:
      return t`: Past`;
    case ViewFilterOperand.IsInFuture:
      return t`: Future`;
    case ViewFilterOperand.IsToday:
      return t`: Today`;
    default:
      return ': ';
  }
};
