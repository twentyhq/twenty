import { type ConditionalAvailabilityRowTree } from '@/conditional-availability/types/ConditionalAvailabilityRowTree';
import { type ConditionalAvailabilityRowTreeChild } from '@/conditional-availability/types/ConditionalAvailabilityRowTreeChild';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const removeConditionalAvailabilityRowTreeNode = ({
  tree,
  nodeId,
}: {
  tree: ConditionalAvailabilityRowTree;
  nodeId: string;
}): ConditionalAvailabilityRowTree => ({
  ...tree,
  children: tree.children.flatMap(
    (child): ConditionalAvailabilityRowTreeChild[] => {
      if (child.type === 'row') {
        return child.row.id === nodeId ? [] : [child];
      }

      const rows = child.group.rows.filter((row) => row.id !== nodeId);

      return child.group.id === nodeId || !isNonEmptyArray(rows)
        ? []
        : [{ type: 'group', group: { ...child.group, rows } }];
    },
  ),
});
