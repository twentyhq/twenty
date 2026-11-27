import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { getConditionalAvailabilityFilterComparisonOperator } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterComparisonOperator';
import { getConditionalAvailabilityFilterLeftNode } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterLeftNode';
import { getConditionalAvailabilityFilterRightNode } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterRightNode';
import {
  type ConditionalEvaluationNode,
  joinConditionalEvaluationNodes,
} from 'twenty-shared/conditional-evaluation';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const convertConditionalAvailabilityFilterOrGroupToNode = ({
  filterOrGroup,
}: {
  filterOrGroup:
    | ConditionalAvailabilityFilter
    | ConditionalAvailabilityFilterGroup;
}): ConditionalEvaluationNode | null => {
  if (filterOrGroup.type === 'filterGroup') {
    const childNodes = filterOrGroup.children
      .map((child) =>
        convertConditionalAvailabilityFilterOrGroupToNode({
          filterOrGroup: child,
        }),
      )
      .filter(isDefined);

    return isNonEmptyArray(childNodes)
      ? joinConditionalEvaluationNodes({
          nodes: childNodes,
          logicalOperator: filterOrGroup.logicalOperator,
        })
      : null;
  }

  const { operator, values } = filterOrGroup;

  if (!isNonEmptyArray(values)) {
    return null;
  }

  const leftNode = getConditionalAvailabilityFilterLeftNode({
    filter: filterOrGroup,
  });
  const comparisonOperator = getConditionalAvailabilityFilterComparisonOperator(
    { operator },
  );

  return joinConditionalEvaluationNodes({
    nodes: values.map((value) => ({
      type: 'COMPARISON',
      operator: comparisonOperator,
      left: leftNode,
      right: getConditionalAvailabilityFilterRightNode({
        filter: filterOrGroup,
        value,
      }),
    })),
    logicalOperator:
      comparisonOperator === 'EQUAL'
        ? doNotTranslate('OR')
        : doNotTranslate('AND'),
  });
};
