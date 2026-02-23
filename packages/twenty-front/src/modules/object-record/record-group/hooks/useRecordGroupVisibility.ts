import { useStore } from 'jotai';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';
import { useRecoilCallback } from 'recoil';

export const useRecordGroupVisibility = () => {
  const store = useStore();

  const recordIndexShouldHideEmptyRecordGroupsAtom =
    useRecoilComponentStateCallbackStateV2(
      recordIndexShouldHideEmptyRecordGroupsComponentState,
    );

  const { saveViewGroup } = useSaveCurrentViewGroups();
  const { updateCurrentView } = useUpdateCurrentView();

  const handleVisibilityChange = useRecoilCallback(
    () => async (updatedRecordGroup: RecordGroupDefinition) => {
      store.set(
        recordGroupDefinitionFamilyState.atomFamily(updatedRecordGroup.id),
        updatedRecordGroup,
      );

      saveViewGroup(recordGroupDefinitionToViewGroup(updatedRecordGroup));
    },
    [saveViewGroup, store],
  );

  const handleHideEmptyRecordGroupChange = useRecoilCallback(
    () => async () => {
      const currentHideState = store.get(
        recordIndexShouldHideEmptyRecordGroupsAtom,
      );

      const newHideState = !currentHideState;

      store.set(recordIndexShouldHideEmptyRecordGroupsAtom, newHideState);

      await updateCurrentView({
        shouldHideEmptyGroups: newHideState,
      });
    },
    [store, recordIndexShouldHideEmptyRecordGroupsAtom, updateCurrentView],
  );

  return {
    handleVisibilityChange,
    handleHideEmptyRecordGroupChange,
  };
};
