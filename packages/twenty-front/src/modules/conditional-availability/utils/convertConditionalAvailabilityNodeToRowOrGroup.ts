import { type ConditionalAvailabilityRowOrGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowOrGroup';
import { convertConditionalAvailabilityComparisonNodeToRow } from '@/conditional-availability/utils/convertConditionalAvailabilityComparisonNodeToRow';
import { mergeConditionalAvailabilityRows } from '@/conditional-availability/utils/mergeConditionalAvailabilityRows';
import { type ConditionalAvailabilityNode } from 'twenty-shared/conditional-availability';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const convertConditionalAvailabilityNodeToRowOrGroup = ({
  node,
}: {
  node: ConditionalAvailabilityNode;
}): ConditionalAvailabilityRowOrGroup | null => {
  if (node.type !== 'GROUP') {
    return convertConditionalAvailabilityComparisonNodeToRow({ node });
  }

  const { logicalOperator } = node;

  const rowsOrGroups = node.children.map((childNode) =>
    convertConditionalAvailabilityNodeToRowOrGroup({ node: childNode }),
  );

  if (!rowsOrGroups.every(isDefined)) {
    return null;
  }

  const children = rowsOrGroups.reduce<ConditionalAvailabilityRowOrGroup[]>(
    (previousRowsOrGroups, rowOrGroup) => {
      const mergedRow = mergeConditionalAvailabilityRows({
        previousRowOrGroup: previousRowsOrGroups.at(-1),
        rowOrGroup,
        logicalOperator,
      });

      return isDefined(mergedRow)
        ? [...previousRowsOrGroups.slice(0, -1), mergedRow]
        : [...previousRowsOrGroups, rowOrGroup];
    },
    [],
  );

  const [onlyChild, ...otherChildren] = children;

  if (!isDefined(onlyChild)) {
    return null;
  }

  return isNonEmptyArray(otherChildren)
    ? { type: 'group', id: v4(), logicalOperator, children }
    : onlyChild;
};
