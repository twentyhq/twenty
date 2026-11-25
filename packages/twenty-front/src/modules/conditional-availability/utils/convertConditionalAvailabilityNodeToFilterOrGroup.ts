import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { convertConditionalAvailabilityComparisonNodeToFilter } from '@/conditional-availability/utils/convertConditionalAvailabilityComparisonNodeToFilter';
import { mergeConditionalAvailabilityFilters } from '@/conditional-availability/utils/mergeConditionalAvailabilityFilters';
import { type ConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const convertConditionalAvailabilityNodeToFilterOrGroup = ({
  node,
}: {
  node: ConditionalEvaluationNode;
}):
  | ConditionalAvailabilityFilter
  | ConditionalAvailabilityFilterGroup
  | null => {
  if (node.type !== 'GROUP') {
    return convertConditionalAvailabilityComparisonNodeToFilter({ node });
  }

  const { logicalOperator } = node;

  const filtersOrGroups = node.children.map((childNode) =>
    convertConditionalAvailabilityNodeToFilterOrGroup({ node: childNode }),
  );

  if (!filtersOrGroups.every(isDefined)) {
    return null;
  }

  const children = filtersOrGroups.reduce<
    (ConditionalAvailabilityFilter | ConditionalAvailabilityFilterGroup)[]
  >((previousFiltersOrGroups, filterOrGroup) => {
    const mergedFilter = mergeConditionalAvailabilityFilters({
      previousFilterOrGroup: previousFiltersOrGroups.at(-1),
      filterOrGroup,
      logicalOperator,
    });

    return isDefined(mergedFilter)
      ? [...previousFiltersOrGroups.slice(0, -1), mergedFilter]
      : [...previousFiltersOrGroups, filterOrGroup];
  }, []);

  const [onlyChild, ...otherChildren] = children;

  if (!isDefined(onlyChild)) {
    return null;
  }

  return isNonEmptyArray(otherChildren)
    ? { type: 'filterGroup', id: v4(), logicalOperator, children }
    : onlyChild;
};
