import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { getConditionalAvailabilityFilterOperatorValueShape } from '@/conditional-availability/utils/getConditionalAvailabilityFilterOperatorValueShape';
import { isConditionalAvailabilityFilterValueValid } from '@/conditional-availability/utils/isConditionalAvailabilityFilterValueValid';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const isConditionalAvailabilityFilterOrGroupValid = ({
  filterOrGroup,
}: {
  filterOrGroup:
    | ConditionalAvailabilityFilter
    | ConditionalAvailabilityFilterGroup;
}): boolean => {
  if (filterOrGroup.type === 'filterGroup') {
    return (
      isNonEmptyArray(filterOrGroup.children) &&
      filterOrGroup.children.every((child) =>
        isConditionalAvailabilityFilterOrGroupValid({ filterOrGroup: child }),
      )
    );
  }

  const { variable, operator, values } = filterOrGroup;
  const canHoldSeveralValues =
    getConditionalAvailabilityFilterOperatorValueShape({ operator }) === 'list';

  return (
    (values.length === 1 || (canHoldSeveralValues && values.length > 1)) &&
    new Set(values).size === values.length &&
    values.every((value) =>
      isConditionalAvailabilityFilterValueValid({ variable, value }),
    )
  );
};
