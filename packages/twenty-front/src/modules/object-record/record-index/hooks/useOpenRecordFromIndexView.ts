import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath } from 'twenty-shared/types';
import { useIsMobile } from 'twenty-ui/utilities';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useOpenRecordFromIndexView = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const navigate = useNavigateApp();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const isMobile = useIsMobile();

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
      const recordIndexOpenRecordIn = store.get(
        recordIndexOpenRecordInState.atom,
      );

      const parentViewFilters = store.get(currentRecordFilters);

      const parentViewSorts = store.get(currentRecordSorts);

      const parentViewFilterGroups = store.get(currentRecordFilterGroups);

      store.set(
        contextStoreRecordShowParentViewComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        {
          parentViewComponentId: recordIndexId,
          parentViewObjectNameSingular: objectNameSingular,
          parentViewFilterGroups,
          parentViewFilters,
          parentViewSorts,
        },
      );

      if (
        !isMobile &&
        recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL &&
        canOpenObjectInSidePanel(objectNameSingular)
      ) {
        openRecordInSidePanel({
          recordId,
          objectNameSingular,
          resetNavigationStack: true,
        });
      } else {
        closeSidePanelMenu();
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
      isMobile,
      closeSidePanelMenu,
      store,
    ],
  );

  return { openRecordFromIndexView };
};
