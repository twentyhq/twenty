import { type ConditionalAvailabilityRowTreeChild } from '@/conditional-availability/types/ConditionalAvailabilityRowTreeChild';
import { convertConditionalAvailabilityComparisonNodeToRow } from '@/conditional-availability/utils/convertConditionalAvailabilityComparisonNodeToRow';
import { mergeConditionalAvailabilityRowTreeChildren } from '@/conditional-availability/utils/mergeConditionalAvailabilityRowTreeChildren';
import { type ConditionalAvailabilityNode } from 'twenty-shared/conditional-availability';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const convertConditionalAvailabilityNodeToRowTreeChild = ({
  node,
}: {
  node: ConditionalAvailabilityNode;
}): ConditionalAvailabilityRowTreeChild | null => {
  if (node.type !== 'GROUP') {
    return convertConditionalAvailabilityComparisonNodeToRow({ node });
  }

  const { logicalOperator } = node;

  const children = node.children.map((childNode) =>
    convertConditionalAvailabilityNodeToRowTreeChild({ node: childNode }),
  );

  if (!children.every(isDefined)) {
    return null;
  }

  const mergedChildren = children.reduce<ConditionalAvailabilityRowTreeChild[]>(
    (previousChildren, child) => {
      const mergedRow = mergeConditionalAvailabilityRowTreeChildren({
        previousChild: previousChildren.at(-1),
        child,
        logicalOperator,
      });

      return isDefined(mergedRow)
        ? [...previousChildren.slice(0, -1), mergedRow]
        : [...previousChildren, child];
    },
    [],
  );

  const [onlyChild, ...otherChildren] = mergedChildren;

  if (!isDefined(onlyChild)) {
    return null;
  }

  return isNonEmptyArray(otherChildren)
    ? { type: 'group', id: v4(), logicalOperator, children: mergedChildren }
    : onlyChild;
};
