import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';

export const useCopyContextStoreStates = () => {
  const copyContextStoreStates = useCallback(
    ({
      instanceIdToCopyFrom,
      instanceIdToCopyTo,
    }: {
      instanceIdToCopyFrom: string;
      instanceIdToCopyTo: string;
    }) => {
      const contextStoreCurrentObjectMetadataItemId = jotaiStore.get(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      jotaiStore.set(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreCurrentObjectMetadataItemId,
      );

      const contextStoreTargetedRecordsRule = jotaiStore.get(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      jotaiStore.set(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreTargetedRecordsRule,
      );

      const contextStoreNumberOfSelectedRecords = jotaiStore.get(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      jotaiStore.set(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreNumberOfSelectedRecords,
      );

      const contextStoreFilters = jotaiStore.get(
        contextStoreFiltersComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      jotaiStore.set(
        contextStoreFiltersComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreFilters,
      );

      const contextStoreFilterGroups = jotaiStore.get(
        contextStoreFilterGroupsComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      jotaiStore.set(
        contextStoreFilterGroupsComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreFilterGroups,
      );

      const contextStoreAnyFieldFilterValue = jotaiStore.get(
        contextStoreAnyFieldFilterValueComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      jotaiStore.set(
        contextStoreAnyFieldFilterValueComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreAnyFieldFilterValue,
      );

      const contextStoreCurrentViewId = jotaiStore.get(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      jotaiStore.set(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreCurrentViewId,
      );

      const contextStoreCurrentViewType = jotaiStore.get(
        contextStoreCurrentViewTypeComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      jotaiStore.set(
        contextStoreCurrentViewTypeComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreCurrentViewType,
      );

      const contextStoreIsFullTabWidgetInEditMode = jotaiStore.get(
        contextStoreIsPageInEditModeComponentState.atomFamily({
          instanceId: instanceIdToCopyFrom,
        }),
      );

      jotaiStore.set(
        contextStoreIsPageInEditModeComponentState.atomFamily({
          instanceId: instanceIdToCopyTo,
        }),
        contextStoreIsFullTabWidgetInEditMode,
      );
    },
    [],
  );

  return { copyContextStoreStates };
};
