import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { getConditionalAvailabilityFilterVariablePath } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariablePath';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import {
  type ExpressionLiteralNode,
  type ExpressionVariableNode,
} from 'twenty-shared/expression';

export const getConditionalAvailabilityFilterRightNode = ({
  filter,
  value,
}: {
  filter: ConditionalAvailabilityFilter;
  value: string;
}): ExpressionLiteralNode | ExpressionVariableNode => {
  if (
    'field' in filter &&
    value === CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID
  ) {
    return {
      type: 'VARIABLE',
      path: getConditionalAvailabilityFilterVariablePath({
        variable: 'currentWorkspaceMember',
      }),
    };
  }

  return { type: 'LITERAL', value };
};
