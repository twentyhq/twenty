import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { recordIndexShouldDisplayGroupsAsTabsComponentState } from '@/object-record/record-index/states/recordIndexShouldDisplayGroupsAsTabsComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';

export const useUpdateRecordGroupDisplay = (recordIndexId: string) => {
  const setRecordIndexShouldDisplayGroupsAsTabs = useSetAtomComponentState(
    recordIndexShouldDisplayGroupsAsTabsComponentState,
  );

  const { updateCurrentView } = useUpdateCurrentView();

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  const updateRecordGroupDisplay = async (
    shouldDisplayGroupsAsTabs: boolean,
  ) => {
    resetRecordSelection();
    setRecordIndexShouldDisplayGroupsAsTabs(shouldDisplayGroupsAsTabs);

    await updateCurrentView({ shouldDisplayGroupsAsTabs });
  };

  return { updateRecordGroupDisplay };
};
