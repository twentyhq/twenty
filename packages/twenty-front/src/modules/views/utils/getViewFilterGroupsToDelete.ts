import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const getViewFilterGroupsToDelete = (
  currentViewFilterGroups: ViewFilterGroup[],
  newViewFilterGroups: ViewFilterGroup[],
) => {
  return currentViewFilterGroups.filter(
    (currentViewFilterGroup) =>
      !newViewFilterGroups.some((newViewFilterGroup) =>
        compareStrictlyExceptForNullAndUndefined(
          newViewFilterGroup.id,
          currentViewFilterGroup.id,
        ),
      ),
  );
};
