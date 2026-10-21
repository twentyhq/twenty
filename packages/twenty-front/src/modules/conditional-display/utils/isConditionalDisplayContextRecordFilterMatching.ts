import { type ConditionalDisplayContext } from '@/conditional-display/types/ConditionalDisplayContext';
import {
  type ConditionalDisplayRecordFilter,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  jsonRelationFilterValueSchema,
  parseJson,
} from 'twenty-shared/utils';

type IsConditionalDisplayContextRecordFilterMatchingParams = {
  recordFilter: ConditionalDisplayRecordFilter;
  context: ConditionalDisplayContext;
};

export const isConditionalDisplayContextRecordFilterMatching = ({
  recordFilter,
  context,
}: IsConditionalDisplayContextRecordFilterMatchingParams): boolean => {
  if (recordFilter.operand !== ViewFilterOperand.IS) {
    return false;
  }

  switch (recordFilter.contextKey) {
    case 'currentRoleId':
    case 'device': {
      const contextValue = context[recordFilter.contextKey];
      const selectedValues = parseJson<unknown>(recordFilter.value);

      return (
        isDefined(contextValue) &&
        Array.isArray(selectedValues) &&
        selectedValues.includes(contextValue)
      );
    }
    case 'currentWorkspaceMemberId': {
      const { currentWorkspaceMemberId } = context;

      if (!isDefined(currentWorkspaceMemberId)) {
        return false;
      }

      const relationFilterValue = jsonRelationFilterValueSchema.safeParse(
        recordFilter.value,
      );

      if (!relationFilterValue.success) {
        return false;
      }

      return (
        relationFilterValue.data.isCurrentWorkspaceMemberSelected === true ||
        relationFilterValue.data.selectedRecordIds.includes(
          currentWorkspaceMemberId,
        )
      );
    }
    default:
      return false;
  }
};
