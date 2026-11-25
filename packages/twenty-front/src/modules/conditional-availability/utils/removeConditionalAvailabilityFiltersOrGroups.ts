import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const removeConditionalAvailabilityFiltersOrGroups = ({
  filterGroup,
  shouldRemove,
}: {
  filterGroup: ConditionalAvailabilityFilterGroup;
  shouldRemove: (
    filterOrGroup:
      | ConditionalAvailabilityFilter
      | ConditionalAvailabilityFilterGroup,
  ) => boolean;
}): ConditionalAvailabilityFilterGroup => ({
  ...filterGroup,
  children: filterGroup.children
    .filter((child) => !shouldRemove(child))
    .map((child) =>
      child.type === 'filterGroup'
        ? removeConditionalAvailabilityFiltersOrGroups({
            filterGroup: child,
            shouldRemove,
          })
        : child,
    )
    .filter(
      (child) => child.type === 'filter' || isNonEmptyArray(child.children),
    ),
});
