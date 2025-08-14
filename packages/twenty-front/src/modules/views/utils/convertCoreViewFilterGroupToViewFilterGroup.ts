import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { type CoreViewFilterGroup } from '~/generated/graphql';

export const convertCoreViewFilterGroupToViewFilterGroup = (
  coreViewFilterGroup: Omit<CoreViewFilterGroup, 'workspaceId'>,
): ViewFilterGroup => {
  return {
    __typename: 'ViewFilterGroup',
    id: coreViewFilterGroup.id,
    viewId: coreViewFilterGroup.viewId,
    parentViewFilterGroupId:
      coreViewFilterGroup.parentViewFilterGroupId ?? null,
    logicalOperator:
      coreViewFilterGroup.logicalOperator === 'AND'
        ? ViewFilterGroupLogicalOperator.AND
        : ViewFilterGroupLogicalOperator.OR,
    positionInViewFilterGroup:
      coreViewFilterGroup.positionInViewFilterGroup ?? null,
  };
};
