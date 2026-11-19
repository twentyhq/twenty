import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowTree } from '@/conditional-availability/types/ConditionalAvailabilityRowTree';
import { type ConditionalAvailabilityRowTreeChild } from '@/conditional-availability/types/ConditionalAvailabilityRowTreeChild';
import { isDefined } from 'twenty-shared/utils';

export const addConditionalAvailabilityRow = ({
  tree,
  row,
  groupId,
}: {
  tree: ConditionalAvailabilityRowTree;
  row: ConditionalAvailabilityRow;
  groupId: string | null;
}): ConditionalAvailabilityRowTree => {
  if (!isDefined(groupId)) {
    return { ...tree, children: [...tree.children, { type: 'row', row }] };
  }

  return {
    ...tree,
    children: tree.children.map((child): ConditionalAvailabilityRowTreeChild =>
      child.type === 'group' && child.group.id === groupId
        ? {
            type: 'group',
            group: { ...child.group, rows: [...child.group.rows, row] },
          }
        : child,
    ),
  };
};
