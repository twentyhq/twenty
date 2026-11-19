import { type ConditionalAvailabilityRowTree } from '@/conditional-availability/types/ConditionalAvailabilityRowTree';
import { type ConditionalAvailabilityRowTreeChild } from '@/conditional-availability/types/ConditionalAvailabilityRowTreeChild';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const setConditionalAvailabilityRowTreeLogicalOperator = ({
  tree,
  groupId,
  logicalOperator,
}: {
  tree: ConditionalAvailabilityRowTree;
  groupId: string | null;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
}): ConditionalAvailabilityRowTree => {
  if (!isDefined(groupId)) {
    return { ...tree, logicalOperator };
  }

  return {
    ...tree,
    children: tree.children.map((child): ConditionalAvailabilityRowTreeChild =>
      child.type === 'group' && child.group.id === groupId
        ? { type: 'group', group: { ...child.group, logicalOperator } }
        : child,
    ),
  };
};
