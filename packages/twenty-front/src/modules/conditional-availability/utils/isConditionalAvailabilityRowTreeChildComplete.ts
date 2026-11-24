import { type ConditionalAvailabilityRowTreeChild } from '@/conditional-availability/types/ConditionalAvailabilityRowTreeChild';
import { getConditionalAvailabilityRowOperatorValueShape } from '@/conditional-availability/utils/getConditionalAvailabilityRowOperatorValueShape';
import { isConditionalAvailabilityRowValueValid } from '@/conditional-availability/utils/isConditionalAvailabilityRowValueValid';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const isConditionalAvailabilityRowTreeChildComplete = ({
  child,
}: {
  child: ConditionalAvailabilityRowTreeChild;
}): boolean => {
  if (child.type === 'group') {
    return (
      isNonEmptyArray(child.children) &&
      child.children.every((groupChild) =>
        isConditionalAvailabilityRowTreeChildComplete({ child: groupChild }),
      )
    );
  }

  const { subject, operator, values } = child;
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
