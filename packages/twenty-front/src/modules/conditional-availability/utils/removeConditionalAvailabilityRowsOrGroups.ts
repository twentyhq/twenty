import { type ConditionalAvailabilityRowGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowGroup';
import { type ConditionalAvailabilityRowOrGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowOrGroup';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const removeConditionalAvailabilityRowsOrGroups = ({
  rowGroup,
  shouldRemove,
}: {
  rowGroup: ConditionalAvailabilityRowGroup;
  shouldRemove: (rowOrGroup: ConditionalAvailabilityRowOrGroup) => boolean;
}): ConditionalAvailabilityRowGroup => ({
  ...rowGroup,
  children: rowGroup.children
    .filter((child) => !shouldRemove(child))
    .map((child) =>
      child.type === 'group'
        ? removeConditionalAvailabilityRowsOrGroups({
            rowGroup: child,
            shouldRemove,
          })
        : child,
    )
    .filter((child) => child.type === 'row' || isNonEmptyArray(child.children)),
});
