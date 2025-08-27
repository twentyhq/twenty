import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const areViewFilterGroupsEqual = (
  viewFilterGroupA: ViewFilterGroup,
  viewFilterGroupB: ViewFilterGroup,
) => {
  const propertiesToCompare: (keyof ViewFilterGroup)[] = [
    'positionInViewFilterGroup',
    'logicalOperator',
    'parentViewFilterGroupId',
    'id',
  ];

  return propertiesToCompare.every((property) =>
    compareStrictlyExceptForNullAndUndefined(
      viewFilterGroupA[property],
      viewFilterGroupB[property],
    ),
  );
};
