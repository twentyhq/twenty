import { CONDITIONAL_AVAILABILITY_DEVICES } from '@/conditional-availability/constants/ConditionalAvailabilityDevices';
import { CONDITIONAL_AVAILABILITY_VALUE_COUNT_RANGE_BY_ARITY } from '@/conditional-availability/constants/ConditionalAvailabilityValueCountRangeByArity';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { getConditionalAvailabilityValueArity } from '@/conditional-availability/utils/getConditionalAvailabilityValueArity';
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

  return isNonEmptyString(value);
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
