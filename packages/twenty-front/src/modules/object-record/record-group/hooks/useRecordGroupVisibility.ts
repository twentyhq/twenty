import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';
import { useRecoilCallback } from 'recoil';

export const useRecordGroupVisibility = () => {
  const recordIndexShouldHideEmptyRecordGroupsCallbackState =
    useRecoilComponentCallbackState(
      recordIndexShouldHideEmptyRecordGroupsComponentState,
    );

  const { saveViewGroup } = useSaveCurrentViewGroups();
  const { updateCurrentView } = useUpdateCurrentView();

  const handleVisibilityChange = useRecoilCallback(
    ({ set }) =>
      async (updatedRecordGroup: RecordGroupDefinition) => {
        set(
          recordGroupDefinitionFamilyState(updatedRecordGroup.id),
          updatedRecordGroup,
        );

        saveViewGroup(recordGroupDefinitionToViewGroup(updatedRecordGroup));
      },
    [saveViewGroup],
  );

  const handleHideEmptyRecordGroupChange = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const currentHideState = snapshot
          .getLoadable(recordIndexShouldHideEmptyRecordGroupsCallbackState)
          .getValue();

        const newHideState = !currentHideState;

        set(recordIndexShouldHideEmptyRecordGroupsCallbackState, newHideState);

        await updateCurrentView({
          shouldHideEmptyGroups: newHideState,
        });
      },
    [recordIndexShouldHideEmptyRecordGroupsCallbackState, updateCurrentView],
  );

  return {
    handleVisibilityChange,
    handleHideEmptyRecordGroupChange,
  };
};
