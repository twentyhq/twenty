import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { convertConditionalAvailabilityFilterOrGroupToNode } from '@/conditional-availability/utils/convertConditionalAvailabilityFilterOrGroupToNode';
import { convertConditionalAvailabilityNodeToFilterOrGroup } from '@/conditional-availability/utils/convertConditionalAvailabilityNodeToFilterOrGroup';
import { type ConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const convertConditionalAvailabilityNodeToFilterGroup = ({
  node,
}: {
  node: ConditionalEvaluationNode;
}): ConditionalAvailabilityFilterGroup | null => {
  const filterOrGroup = convertConditionalAvailabilityNodeToFilterOrGroup({
    node,
  });

  if (!isDefined(filterOrGroup)) {
    return null;
  }

  const filterGroupAroundSingleFilter: ConditionalAvailabilityFilterGroup = {
    type: 'filterGroup',
    id: v4(),
    logicalOperator: doNotTranslate('AND'),
    children: [filterOrGroup],
  };
  const filterGroup =
    filterOrGroup.type === 'filterGroup'
      ? filterOrGroup
      : filterGroupAroundSingleFilter;

  const hasFilterGroupInsideFilterGroup = filterGroup.children.some(
    (child) =>
      child.type === 'filterGroup' &&
      child.children.some((grandchild) => grandchild.type === 'filterGroup'),
  );

  const isStoredNodeWrittenBackUnchanged = isDeeplyEqual(
    convertConditionalAvailabilityFilterOrGroupToNode({
      filterOrGroup: filterGroup,
    }),
    node,
  );

  return !hasFilterGroupInsideFilterGroup && isStoredNodeWrittenBackUnchanged
    ? filterGroup
    : null;
};
