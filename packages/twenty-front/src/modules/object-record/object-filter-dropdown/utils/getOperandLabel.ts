import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ViewFilterOperand } from 'twenty-shared/types';

export const getOperandLabel = (
  operand: ViewFilterOperand | null | undefined,
  timeZoneAbbreviation?: string | null | undefined,
) => {
  const shouldDisplayTimeZoneAbbreviation =
    isNonEmptyString(timeZoneAbbreviation);

  const timeZoneAbbreviationSuffix = shouldDisplayTimeZoneAbbreviation
    ? ` (${timeZoneAbbreviation})`
    : '';

  switch (operand) {
    case ViewFilterOperand.CONTAINS:
      return t`Contains`;
    case ViewFilterOperand.DOES_NOT_CONTAIN:
      return t`Doesn't contain`;
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL:
      return t`Greater than or equal`;
    case ViewFilterOperand.LESS_THAN_OR_EQUAL:
      return t`Less than or equal`;
    case ViewFilterOperand.IS_BEFORE:
      return t`Is before`;
    case ViewFilterOperand.IS_AFTER:
      return t`Is after or equal`;
    case ViewFilterOperand.IS:
      return t`Is`;
    case ViewFilterOperand.IS_NOT:
      return t`Is not`;
    case ViewFilterOperand.IS_NOT_NULL:
      return t`Is not null`;
    case ViewFilterOperand.IS_EMPTY:
      return t`Is empty`;
    case ViewFilterOperand.IS_NOT_EMPTY:
      return t`Is not empty`;
    case ViewFilterOperand.IS_RELATIVE:
      return t`Is relative`;
    case ViewFilterOperand.IS_IN_PAST:
      return t`Is in past`;
    case ViewFilterOperand.IS_IN_FUTURE:
      return t`Is in future`;
    case ViewFilterOperand.IS_TODAY:
      return t`Is today${timeZoneAbbreviationSuffix}`;
    default:
      return '';
  }
};

export const getOperandLabelShort = (
  operand: ViewFilterOperand | null | undefined,
  timeZoneAbbreviation?: string | null | undefined,
) => {
  const shouldDisplayTimeZoneAbbreviation =
    isNonEmptyString(timeZoneAbbreviation);

  const timeZoneAbbreviationSuffix = shouldDisplayTimeZoneAbbreviation
    ? ` (${timeZoneAbbreviation})`
    : '';

  switch (operand) {
    case ViewFilterOperand.IS:
    case ViewFilterOperand.CONTAINS:
      return ': ';
    case ViewFilterOperand.IS_NOT:
    case ViewFilterOperand.DOES_NOT_CONTAIN:
      return t`: Not`;
    case ViewFilterOperand.IS_NOT_NULL:
      return t`: NotNull`;
    case ViewFilterOperand.IS_NOT_EMPTY:
      return t`: NotEmpty`;
    case ViewFilterOperand.IS_EMPTY:
      return t`: Empty`;
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL:
      return '\u00A0≥ ';
    case ViewFilterOperand.LESS_THAN_OR_EQUAL:
      return '\u00A0≤ ';
    case ViewFilterOperand.IS_BEFORE:
      return '\u00A0< ';
    case ViewFilterOperand.IS_AFTER:
      return '\u00A0≥ ';
    case ViewFilterOperand.IS_IN_PAST:
      return t`: Past`;
    case ViewFilterOperand.IS_IN_FUTURE:
      return t`: Future`;
    case ViewFilterOperand.IS_TODAY:
      return t`: Today${timeZoneAbbreviationSuffix}`;
    default:
      return ': ';
  }
};
