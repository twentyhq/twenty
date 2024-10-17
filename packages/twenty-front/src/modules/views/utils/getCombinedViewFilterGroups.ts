import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';

export const getCombinedViewFilterGroups = (
  viewFilterGroups: ViewFilterGroup[],
  unsavedToUpsertViewFilterGroups: ViewFilterGroup[],
  unsavedToDeleteViewFilterGroupIds: string[],
): ViewFilterGroup[] => {
  const toCreateViewFilterGroups = unsavedToUpsertViewFilterGroups.filter(
    (toUpsertViewFilterGroup) =>
      !viewFilterGroups.some(
        (viewFilterGroup) => viewFilterGroup.id === toUpsertViewFilterGroup.id,
      ),
  );

  const toUpdateViewFilterGroups = unsavedToUpsertViewFilterGroups.filter(
    (toUpsertViewFilterGroup) =>
      viewFilterGroups.some(
        (viewFilterGroup) => viewFilterGroup.id === toUpsertViewFilterGroup.id,
      ),
  );

  const combinedViewFilterGroups = viewFilterGroups
    .filter(
      (viewFilterGroup) =>
        !unsavedToDeleteViewFilterGroupIds.includes(viewFilterGroup.id),
    )
    .map((viewFilterGroup) => {
      const toUpdateViewFilterGroup = toUpdateViewFilterGroups.find(
        (toUpdateViewFilterGroup) =>
          toUpdateViewFilterGroup.id === viewFilterGroup.id,
      );

      return toUpdateViewFilterGroup ?? viewFilterGroup;
    })
    .concat(toCreateViewFilterGroups);

  return combinedViewFilterGroups;
};
