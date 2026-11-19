import { CONDITIONAL_AVAILABILITY_CURRENT_WORKSPACE_MEMBER_OPTION_VALUE } from '@/conditional-availability/constants/ConditionalAvailabilityCurrentWorkspaceMemberOptionValue';
import { CONDITIONAL_AVAILABILITY_DEVICES } from '@/conditional-availability/constants/ConditionalAvailabilityDevices';
import { CONDITIONAL_AVAILABILITY_VALUE_COUNT_RANGE_BY_ARITY } from '@/conditional-availability/constants/ConditionalAvailabilityValueCountRangeByArity';
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

export const isConditionalAvailabilityRowComplete = ({
  row,
}: {
  row: ConditionalAvailabilityRow;
}): boolean => {
  const { min, max } =
    CONDITIONAL_AVAILABILITY_VALUE_COUNT_RANGE_BY_ARITY[
      getConditionalAvailabilityValueArity({ row })
    ];

  return (
    row.values.length >= min &&
    row.values.length <= max &&
    new Set(row.values).size === row.values.length &&
    row.values.every((value) => isValueValid({ row, value }))
  );
};
