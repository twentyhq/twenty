import { type ConditionalAvailabilityRowGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowGroup';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const removeConditionalAvailabilityRowOrGroup = ({
  rowGroup,
  rowOrGroupId,
}: {
  rowGroup: ConditionalAvailabilityRowGroup;
  rowOrGroupId: string;
}): ConditionalAvailabilityRowGroup => ({
  ...rowGroup,
  children: rowGroup.children
    .filter((child) => child.id !== rowOrGroupId)
    .map((child) =>
      child.type === 'group'
        ? removeConditionalAvailabilityRowOrGroup({
            rowGroup: child,
            rowOrGroupId,
          })
        : child,
    )
    .filter((child) => child.type === 'row' || isNonEmptyArray(child.children)),
});
