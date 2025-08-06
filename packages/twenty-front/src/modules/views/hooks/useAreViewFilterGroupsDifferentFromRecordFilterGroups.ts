import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { getViewFilterGroupsToCreate } from '@/views/utils/getViewFilterGroupsToCreate';
import { getViewFilterGroupsToDelete } from '@/views/utils/getViewFilterGroupsToDelete';
import { getViewFilterGroupsToUpdate } from '@/views/utils/getViewFilterGroupsToUpdate';
import { mapRecordFilterGroupToViewFilterGroup } from '@/views/utils/mapRecordFilterGroupToViewFilterGroup';
import { isDefined } from 'twenty-shared/utils';

export const useAreViewFilterGroupsDifferentFromRecordFilterGroups = () => {
  const { currentView } = useGetCurrentViewOnly();

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentViewFilterGroups = currentView?.viewFilterGroups ?? [];

  const viewFilterGroupsFromCurrentRecordFilterGroups = isDefined(currentView)
    ? currentRecordFilterGroups.map((recordFilterGroup) =>
        mapRecordFilterGroupToViewFilterGroup({
          recordFilterGroup,
          view: currentView,
        }),
      )
    : [];

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

  const viewFilterGroupsAreDifferentFromRecordFilterGroups =
    viewFilterGroupsToCreate.length > 0 ||
    viewFilterGroupsToDelete.length > 0 ||
    viewFilterGroupsToUpdate.length > 0;

  return {
    viewFilterGroupsAreDifferentFromRecordFilterGroups,
  };
};
