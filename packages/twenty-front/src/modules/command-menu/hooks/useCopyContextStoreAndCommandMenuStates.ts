import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useCopyContextStoreStates = () => {
  const store = useStore();
  const copyContextStoreStates = useCallback(
    ({
      instanceIdToCopyFrom,
      instanceIdToCopyTo,
    }: {
      instanceIdToCopyFrom: string;
      instanceIdToCopyTo: string;
    }) => {
      const contextStoreCurrentObjectMetadataItemId = store.get(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      store.set(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreCurrentObjectMetadataItemId,
      );

      const contextStoreTargetedRecordsRule = store.get(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      store.set(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreTargetedRecordsRule,
      );

      const contextStoreNumberOfSelectedRecords = store.get(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      store.set(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreNumberOfSelectedRecords,
      );

      const contextStoreFilters = store.get(
        contextStoreFiltersComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      store.set(
        contextStoreFiltersComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreFilters,
      );

      const contextStoreFilterGroups = store.get(
        contextStoreFilterGroupsComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      store.set(
        contextStoreFilterGroupsComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreFilterGroups,
      );

      const contextStoreAnyFieldFilterValue = store.get(
        contextStoreAnyFieldFilterValueComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      store.set(
        contextStoreAnyFieldFilterValueComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreAnyFieldFilterValue,
      );

      const contextStoreCurrentViewId = store.get(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      store.set(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreCurrentViewId,
      );

      const contextStoreCurrentViewType = store.get(
        contextStoreCurrentViewTypeComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      store.set(
        contextStoreCurrentViewTypeComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreCurrentViewType,
      );

      const contextStoreIsFullTabWidgetInEditMode = store.get(
        contextStoreIsPageInEditModeComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      store.set(
        contextStoreIsPageInEditModeComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreIsFullTabWidgetInEditMode,
      );
    },
    [store],
  );

  return { copyContextStoreStates };
};
