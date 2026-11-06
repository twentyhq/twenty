import { recordIndexShouldDisplayGroupsAsTabsComponentState } from '@/object-record/record-index/states/recordIndexShouldDisplayGroupsAsTabsComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';

export const useUpdateRecordGroupDisplay = () => {
  const setRecordIndexShouldDisplayGroupsAsTabs = useSetAtomComponentState(
    recordIndexShouldDisplayGroupsAsTabsComponentState,
  );

  const { updateCurrentView } = useUpdateCurrentView();

  const updateRecordGroupDisplay = async (
    shouldDisplayGroupsAsTabs: boolean,
  ) => {
    setRecordIndexShouldDisplayGroupsAsTabs(shouldDisplayGroupsAsTabs);

    await updateCurrentView({ shouldDisplayGroupsAsTabs });
  };

  return { updateRecordGroupDisplay };
};
