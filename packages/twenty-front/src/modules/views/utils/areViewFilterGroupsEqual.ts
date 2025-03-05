import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const areViewFilterGroupsEqual = (
  viewFilterGroupA: ViewFilterGroup,
  viewFilterGroupB: ViewFilterGroup,
) => {
  const propertiesToCompare: (keyof ViewFilterGroup)[] = [
    'positionInViewFilterGroup',
    'logicalOperator',
    'parentViewFilterGroupId',
    'viewId',
  ];

  return propertiesToCompare.every((property) =>
    compareStrictlyExceptForNullAndUndefined(
      viewFilterGroupA[property],
      viewFilterGroupB[property],
    ),
  );
};
