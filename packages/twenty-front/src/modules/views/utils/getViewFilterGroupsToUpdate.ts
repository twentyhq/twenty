import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { areViewFilterGroupsEqual } from '@/views/utils/areViewFilterGroupsEqual';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';
import { isDefined } from 'twenty-shared/utils';

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
