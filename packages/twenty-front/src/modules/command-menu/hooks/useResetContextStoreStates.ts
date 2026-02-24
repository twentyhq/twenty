import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';

export const useResetContextStoreStates = () => {
  const resetContextStoreStates = useCallback((instanceId: string) => {
    jotaiStore.set(
      contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
        instanceId,
      }),
      undefined,
    );

    jotaiStore.set(
      contextStoreTargetedRecordsRuleComponentState.atomFamily({
        instanceId,
      }),
      {
        mode: 'selection',
        selectedRecordIds: [],
      },
    );

    jotaiStore.set(
      contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
        instanceId,
      }),
      0,
    );

    jotaiStore.set(
      contextStoreFiltersComponentState.atomFamily({
        instanceId,
      }),
      [],
    );

    jotaiStore.set(
      contextStoreFilterGroupsComponentState.atomFamily({
        instanceId,
      }),
      [],
    );

    jotaiStore.set(
      contextStoreAnyFieldFilterValueComponentState.atomFamily({
        instanceId,
      }),
      '',
    );

    jotaiStore.set(
      contextStoreCurrentViewIdComponentState.atomFamily({
        instanceId,
      }),
      undefined,
    );
  }, []);

  return { resetContextStoreStates };
};
