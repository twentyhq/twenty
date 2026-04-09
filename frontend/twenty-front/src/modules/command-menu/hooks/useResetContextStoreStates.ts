import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useResetContextStoreStates = () => {
  const store = useStore();
  const resetContextStoreStates = useCallback(
    (instanceId: string) => {
      store.set(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId,
        }),
        undefined,
      );

      store.set(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId,
        }),
        {
          mode: 'selection',
          selectedRecordIds: [],
        },
      );

      store.set(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
          instanceId,
        }),
        0,
      );

      store.set(
        contextStoreFiltersComponentState.atomFamily({
          instanceId,
        }),
        [],
      );

      store.set(
        contextStoreFilterGroupsComponentState.atomFamily({
          instanceId,
        }),
        [],
      );

      store.set(
        contextStoreAnyFieldFilterValueComponentState.atomFamily({
          instanceId,
        }),
        '',
      );

      store.set(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId,
        }),
        undefined,
      );
    },
    [store],
  );

  return { resetContextStoreStates };
};
