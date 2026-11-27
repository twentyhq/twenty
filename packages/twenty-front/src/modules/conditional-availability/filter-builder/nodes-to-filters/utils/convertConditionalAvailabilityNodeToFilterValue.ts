import { getConditionalAvailabilityFilterVariablePath } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariablePath';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { isNonEmptyString } from '@sniptt/guards';
import { type ConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';

export const convertConditionalAvailabilityNodeToFilterValue = ({
  node,
}: {
  node: ConditionalEvaluationNode;
}): string | null => {
  if (node.type === 'LITERAL' && isNonEmptyString(node.value)) {
    return node.value;
  }

  const currentWorkspaceMemberPath =
    getConditionalAvailabilityFilterVariablePath({
      variable: 'currentWorkspaceMember',
    });

  if (node.type === 'VARIABLE' && node.path === currentWorkspaceMemberPath) {
    return CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID;
  }

  return null;
};
