import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { isDefined } from 'twenty-shared';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const getViewFilterGroupsToCreate = (
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

    const shouldCreateBecauseViewFilterGroupIsNew = !isDefined(
      correspondingViewFilterGroup,
    );

    return shouldCreateBecauseViewFilterGroupIsNew;
  });
};
