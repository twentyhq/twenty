import { CONDITIONAL_AVAILABILITY_DEVICES } from '@/conditional-availability/constants/ConditionalAvailabilityDevices';
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

const hasExpectedValueCount = ({
  row,
}: {
  row: ConditionalAvailabilityRow;
}): boolean => {
  switch (getConditionalAvailabilityValueArity({ row })) {
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
