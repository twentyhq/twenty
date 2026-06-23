import { useStore } from 'jotai';

import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { usePersistRelationRecordGroups } from '@/object-record/record-group/hooks/usePersistRelationRecordGroups';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordGroupVisibility = () => {
  const store = useStore();

  const recordIndexShouldHideEmptyRecordGroups =
    useAtomComponentStateCallbackState(
      recordIndexShouldHideEmptyRecordGroupsComponentState,
    );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const { saveViewGroup } = useSaveCurrentViewGroups();
  const { persistRelationRecordGroups } = usePersistRelationRecordGroups();
  const { updateCurrentView } = useUpdateCurrentView();

  const handleVisibilityChange = useCallback(
    async (updatedRecordGroup: RecordGroupDefinition) => {
      store.set(
        recordGroupDefinitionFamilyState.atomFamily(updatedRecordGroup.id),
        updatedRecordGroup,
      );

      if (
        isDefined(recordIndexGroupFieldMetadataItem) &&
        isManyToOneRelationField(recordIndexGroupFieldMetadataItem)
      ) {
        persistRelationRecordGroups([updatedRecordGroup]);
      } else {
        saveViewGroup(recordGroupDefinitionToViewGroup(updatedRecordGroup));
      }
    },
    [
      persistRelationRecordGroups,
      recordIndexGroupFieldMetadataItem,
      saveViewGroup,
      store,
    ],
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
