import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { getViewFilterGroupsToCreate } from '@/views/utils/getViewFilterGroupsToCreate';
import { getViewFilterGroupsToDelete } from '@/views/utils/getViewFilterGroupsToDelete';
import { getViewFilterGroupsToUpdate } from '@/views/utils/getViewFilterGroupsToUpdate';
import { mapRecordFilterGroupToViewFilterGroup } from '@/views/utils/mapRecordFilterGroupToViewFilterGroup';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared';

export const useAreViewFilterGroupsDifferentFromRecordFilterGroups = () => {
  const { currentView } = useGetCurrentViewOnly();

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const viewFilterGroupsAreDifferentFromRecordFilterGroups = useMemo(() => {
    if (!isDefined(currentView)) {
      return undefined;
    }

    const currentViewFilterGroups = currentView?.viewFilterGroups ?? [];

    const viewFilterGroupsFromCurrentRecordFilterGroups =
      currentRecordFilterGroups.map((recordFilterGroup) =>
        mapRecordFilterGroupToViewFilterGroup({
          recordFilterGroup,
          view: currentView,
        }),
      );

    const viewFilterGroupsToCreate = getViewFilterGroupsToCreate(
      currentViewFilterGroups,
      viewFilterGroupsFromCurrentRecordFilterGroups,
    );

    const viewFilterGroupsToDelete = getViewFilterGroupsToDelete(
      currentViewFilterGroups,
      viewFilterGroupsFromCurrentRecordFilterGroups,
    );

    const viewFilterGroupsToUpdate = getViewFilterGroupsToUpdate(
      currentViewFilterGroups,
      viewFilterGroupsFromCurrentRecordFilterGroups,
    );

    const viewFilterGroupsHaveChanged =
      viewFilterGroupsToCreate.length > 0 ||
      viewFilterGroupsToDelete.length > 0 ||
      viewFilterGroupsToUpdate.length > 0;

    return viewFilterGroupsHaveChanged;
  }, [currentRecordFilterGroups, currentView]);

  return {
    viewFilterGroupsAreDifferentFromRecordFilterGroups,
  };
};
