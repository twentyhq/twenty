import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
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
  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const isMobile = useIsMobile();

  const currentRecordFilters = useRecoilComponentStateCallbackStateV2(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const currentRecordSorts = useRecoilComponentStateCallbackStateV2(
    currentRecordSortsComponentState,
    recordIndexId,
  );

  const currentRecordFilterGroups = useRecoilComponentStateCallbackStateV2(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  const { closeCommandMenu } = useCommandMenu();

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
        openRecordInCommandMenu({
          recordId,
          objectNameSingular,
          resetNavigationStack: true,
        });
      } else {
        closeCommandMenu();
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
      openRecordInCommandMenu,
      isMobile,
      closeCommandMenu,
      store,
    ],
  );

  return { openRecordFromIndexView };
};
