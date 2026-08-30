import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useResolveOpenRecordIn } from '@/object-record/record-index/hooks/useResolveOpenRecordIn';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath, OpenRecordIn, SidePanelPages } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useOpenRecordFromIndexView = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const navigate = useNavigateApp();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const openRecordIn = useResolveOpenRecordIn(objectNameSingular);

  const currentRecordFilters = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const currentRecordSorts = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
    recordIndexId,
  );

  const currentRecordFilterGroups = useAtomComponentStateCallbackState(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  const { closeSidePanelMenu } = useSidePanelMenu();

  const store = useStore();

  const openRecordFromIndexView = useCallback(
    ({ recordId }: { recordId: string }) => {
      const parentViewFilters = store.get(currentRecordFilters);

      const parentViewSorts = store.get(currentRecordSorts);

      const parentViewFilterGroups = store.get(currentRecordFilterGroups);

      const parentView = {
        parentViewComponentId: recordIndexId,
        parentViewObjectNameSingular: objectNameSingular,
        parentViewFilterGroups,
        parentViewFilters,
        parentViewSorts,
      };

      // The record's related lists read this from the store of the surface they
      // render on, so it has to land on the destination rather than on the index
      // that is handing it over.
      const setParentViewOn = (instanceId: string) =>
        store.set(
          contextStoreRecordShowParentViewComponentState.atomFamily({
            instanceId,
          }),
          parentView,
        );

      if (openRecordIn === OpenRecordIn.SIDE_PANEL) {
        const sidePanelPageInstanceId = openRecordInSidePanel({
          recordId,
          objectNameSingular,
          resetNavigationStack: true,
        });

        setParentViewOn(
          sidePanelPageInstanceId ?? MAIN_CONTEXT_STORE_INSTANCE_ID,
        );
      } else {
        setParentViewOn(MAIN_CONTEXT_STORE_INSTANCE_ID);

        const isSidePanelAiChat =
          store.get(sidePanelPageState.atom) === SidePanelPages.AskAI;

        if (!isSidePanelAiChat) {
          closeSidePanelMenu();
        }

        navigate(AppPath.RecordShowPage, {
          objectNameSingular,
          objectRecordId: recordId,
        });
      }
    },
    [
      currentRecordFilters,
      currentRecordSorts,
      currentRecordFilterGroups,
      recordIndexId,
      objectNameSingular,
      navigate,
      openRecordInSidePanel,
      openRecordIn,
      closeSidePanelMenu,
      store,
    ],
  );

  return { openRecordFromIndexView };
};
