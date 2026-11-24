import { type ConditionalAvailabilityRowOrGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowOrGroup';
import { getConditionalAvailabilityRowOperatorValueShape } from '@/conditional-availability/utils/getConditionalAvailabilityRowOperatorValueShape';
import { isConditionalAvailabilityRowValueValid } from '@/conditional-availability/utils/isConditionalAvailabilityRowValueValid';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const isConditionalAvailabilityRowOrGroupValid = ({
  rowOrGroup,
}: {
  rowOrGroup: ConditionalAvailabilityRowOrGroup;
}): boolean => {
  if (rowOrGroup.type === 'group') {
    return (
      isNonEmptyArray(rowOrGroup.children) &&
      rowOrGroup.children.every((child) =>
        isConditionalAvailabilityRowOrGroupValid({ rowOrGroup: child }),
      )
    );
  }

  const { subject, operator, values } = rowOrGroup;
  const canHoldSeveralValues =
    getConditionalAvailabilityRowOperatorValueShape({ operator }) === 'list';

  return (
    (values.length === 1 || (canHoldSeveralValues && values.length > 1)) &&
    new Set(values).size === values.length &&
    values.every((value) =>
      isConditionalAvailabilityRowValueValid({ subject, value }),
    )
  );
};
