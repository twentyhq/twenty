import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { type CoreViewFilterGroup } from '~/generated-metadata/graphql';

export const convertCoreViewFilterGroupToViewFilterGroup = (
  coreViewFilterGroup: Pick<
    CoreViewFilterGroup,
    | 'id'
    | 'viewId'
    | 'parentViewFilterGroupId'
    | 'logicalOperator'
    | 'positionInViewFilterGroup'
  >,
): ViewFilterGroup => {
  return {
    __typename: 'ViewFilterGroup',
    id: coreViewFilterGroup.id,
    viewId: coreViewFilterGroup.viewId,
    parentViewFilterGroupId:
      coreViewFilterGroup.parentViewFilterGroupId ?? null,
    logicalOperator:
      {
        AND: ViewFilterGroupLogicalOperator.AND,
        OR: ViewFilterGroupLogicalOperator.OR,
        NOT: ViewFilterGroupLogicalOperator.NOT,
      }[coreViewFilterGroup.logicalOperator] ??
      ViewFilterGroupLogicalOperator.AND,
    positionInViewFilterGroup:
      coreViewFilterGroup.positionInViewFilterGroup ?? null,
  };
};
