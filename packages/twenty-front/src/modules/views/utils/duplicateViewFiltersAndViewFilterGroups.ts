import { type ViewFilter } from '@/views/types/ViewFilter';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';

export const duplicateViewFiltersAndViewFilterGroups = ({
  viewFilterGroupsToDuplicate,
  viewFiltersToDuplicate,
}: {
  viewFiltersToDuplicate: ViewFilter[];
  viewFilterGroupsToDuplicate: ViewFilterGroup[];
}) => {
  const oldViewFilterGroupIdToNewViewFilterGroupIdMap = new Map<
    string,
    string
  >();

  for (const viewFilterGroupToCopy of viewFilterGroupsToDuplicate) {
    oldViewFilterGroupIdToNewViewFilterGroupIdMap.set(
      viewFilterGroupToCopy.id,
      v4(),
    );
  }

  const duplicatedViewFilterGroups = viewFilterGroupsToDuplicate.map(
    (viewFilterGroupToCopy) => {
      const newViewFilterGroupId =
        oldViewFilterGroupIdToNewViewFilterGroupIdMap.get(
          viewFilterGroupToCopy.id,
        );

      if (
        !isDefined(viewFilterGroupToCopy.id) ||
        !isDefined(newViewFilterGroupId)
      ) {
        throw new Error(
          `Failed to find view filter group to copy for id ${viewFilterGroupToCopy.id} this shouldn't happen`,
        );
      }

      const parentViewFilterGroupIdToCopy =
        viewFilterGroupToCopy.parentViewFilterGroupId;

      const newParentViewFilterGroupId = isDefined(
        parentViewFilterGroupIdToCopy,
      )
        ? oldViewFilterGroupIdToNewViewFilterGroupIdMap.get(
            parentViewFilterGroupIdToCopy,
          )
        : undefined;

      const newViewFilterGroup = {
        ...viewFilterGroupToCopy,
        id: newViewFilterGroupId,
        parentViewFilterGroupId: newParentViewFilterGroupId,
      } satisfies ViewFilterGroup;

      return newViewFilterGroup;
    },
  );

  const duplicatedViewFilters = viewFiltersToDuplicate.map((viewFilter) => {
    const parentViewFilterGroupIdToCopy = viewFilter.viewFilterGroupId;

    const newParentViewFilterGroupId = isDefined(parentViewFilterGroupIdToCopy)
      ? oldViewFilterGroupIdToNewViewFilterGroupIdMap.get(
          parentViewFilterGroupIdToCopy,
        )
      : undefined;

    return {
      ...viewFilter,
      id: v4(),
      viewFilterGroupId: newParentViewFilterGroupId,
    } satisfies ViewFilter;
  });

  return {
    duplicatedViewFilterGroups,
    duplicatedViewFilters,
  };
};
