import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { getConditionalAvailabilityFilterComparisonOperator } from '@/conditional-availability/utils/getConditionalAvailabilityFilterComparisonOperator';
import { getConditionalAvailabilityFilterVariablePath } from '@/conditional-availability/utils/getConditionalAvailabilityFilterVariablePath';
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

  const { variable, operator, values } = filterOrGroup;

  if (!isNonEmptyArray(values)) {
    return null;
  }

  const variablePath = getConditionalAvailabilityFilterVariablePath({
    variable,
  });
  const comparisonOperator = getConditionalAvailabilityFilterComparisonOperator(
    { operator },
  );

  return joinConditionalEvaluationNodes({
    nodes: values.map((value) => ({
      type: 'COMPARISON',
      operator: comparisonOperator,
      left: { type: 'VARIABLE', path: variablePath },
      right: { type: 'LITERAL', value },
    })),
    logicalOperator:
      comparisonOperator === 'EQUAL'
        ? doNotTranslate('OR')
        : doNotTranslate('AND'),
  });
};
