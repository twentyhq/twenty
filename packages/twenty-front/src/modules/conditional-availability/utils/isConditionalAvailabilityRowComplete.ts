import { CONDITIONAL_AVAILABILITY_CURRENT_WORKSPACE_MEMBER_OPTION_VALUE } from '@/conditional-availability/constants/ConditionalAvailabilityCurrentWorkspaceMemberOptionValue';
import { CONDITIONAL_AVAILABILITY_DEVICES } from '@/conditional-availability/constants/ConditionalAvailabilityDevices';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { getConditionalAvailabilityValueArity } from '@/conditional-availability/utils/getConditionalAvailabilityValueArity';
import { isConditionalAvailabilityDayValue } from '@/conditional-availability/utils/isConditionalAvailabilityDayValue';
import { isNonEmptyString } from '@sniptt/guards';

const isValueValid = ({
  row,
  value,
}: {
  row: ConditionalAvailabilityRow;
  value: string;
}): boolean => {
  if (row.subject === 'device') {
    return CONDITIONAL_AVAILABILITY_DEVICES.some((device) => device === value);
  }

  if (row.subject !== 'recordField') {
    return isNonEmptyString(value);
  }

  switch (row.fieldKind) {
    case 'number':
    case 'currencyAmount':
      return Number.isFinite(Number(value)) && String(Number(value)) === value;
    case 'boolean':
      return value === 'true' || value === 'false';
    case 'date':
    case 'dateTime':
      return isConditionalAvailabilityDayValue({ value });
    case 'recordRelation':
      return (
        isNonEmptyString(value) &&
        value !== CONDITIONAL_AVAILABILITY_CURRENT_WORKSPACE_MEMBER_OPTION_VALUE
      );
    default:
      return isNonEmptyString(value);
  }
};

const hasExpectedValueCount = ({
  row,
}: {
  row: ConditionalAvailabilityRow;
}): boolean => {
  switch (getConditionalAvailabilityValueArity({ row })) {
    case 'none':
      return row.values.length === 0;
    case 'single':
      return row.values.length === 1;
    case 'list':
      return row.values.length >= 1;
  }
};

export const isConditionalAvailabilityRowComplete = ({
  row,
}: {
  row: ConditionalAvailabilityRow;
}): boolean => {
  return (
    hasExpectedValueCount({ row }) &&
    new Set(row.values).size === row.values.length &&
    row.values.every((value) => isValueValid({ row, value }))
  );
};
