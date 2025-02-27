import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { areViewFilterGroupsEqual } from '@/views/utils/areViewFilterGroupsEqual';
import { isDefined } from 'twenty-shared';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const getViewFilterGroupsToUpdate = (
  currentViewFilterGroups: ViewFilterGroup[],
  newViewFilterGroups: ViewFilterGroup[],
) => {
  return newViewFilterGroups.filter((newViewFilterGroup) => {
    const correspondingViewFilterGroup = currentViewFilterGroups.find(
      (currentViewFilterGroup) =>
        compareStrictlyExceptForNullAndUndefined(
          currentViewFilterGroup.id,
          newViewFilterGroup.id,
        ),
    );

    if (!isDefined(correspondingViewFilterGroup)) {
      return false;
    }

    const shouldUpdateBecauseViewFilterGroupIsDifferent =
      !areViewFilterGroupsEqual(
        newViewFilterGroup,
        correspondingViewFilterGroup,
      );

    return shouldUpdateBecauseViewFilterGroupIsDifferent;
  });
};
