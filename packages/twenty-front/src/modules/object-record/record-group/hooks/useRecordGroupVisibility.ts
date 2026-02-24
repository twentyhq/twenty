import { useStore } from 'jotai';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';
import { useCallback } from 'react';

export const useRecordGroupVisibility = () => {
  const store = useStore();

  const recordIndexShouldHideEmptyRecordGroups =
    useRecoilComponentStateCallbackStateV2(
      recordIndexShouldHideEmptyRecordGroupsComponentState,
    );

  const { saveViewGroup } = useSaveCurrentViewGroups();
  const { updateCurrentView } = useUpdateCurrentView();

  const handleVisibilityChange = useCallback(
    async (updatedRecordGroup: RecordGroupDefinition) => {
      store.set(
        recordGroupDefinitionFamilyState.atomFamily(updatedRecordGroup.id),
        updatedRecordGroup,
      );

      saveViewGroup(recordGroupDefinitionToViewGroup(updatedRecordGroup));
    },
    [saveViewGroup, store],
  );

  const handleHideEmptyRecordGroupChange = useCallback(async () => {
    const currentHideState = store.get(recordIndexShouldHideEmptyRecordGroups);

    const newHideState = !currentHideState;

    store.set(recordIndexShouldHideEmptyRecordGroups, newHideState);

    await updateCurrentView({
      shouldHideEmptyGroups: newHideState,
    });
  }, [store, recordIndexShouldHideEmptyRecordGroups, updateCurrentView]);

  return {
    handleVisibilityChange,
    handleHideEmptyRecordGroupChange,
  };
};
