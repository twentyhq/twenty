import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const removeConditionalAvailabilityFilterOrGroup = ({
  filterGroup,
  filterOrGroupId,
}: {
  filterGroup: ConditionalAvailabilityFilterGroup;
  filterOrGroupId: string;
}): ConditionalAvailabilityFilterGroup => ({
  ...filterGroup,
  children: filterGroup.children
    .filter((child) => child.id !== filterOrGroupId)
    .map((child) =>
      child.type === 'filterGroup'
        ? removeConditionalAvailabilityFilterOrGroup({
            filterGroup: child,
            filterOrGroupId,
          })
        : child,
    )
    .filter(
      (child) => child.type === 'filter' || isNonEmptyArray(child.children),
    ),
});
