import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { AppPath } from '@/types/AppPath';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilCallback } from 'recoil';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useOpenRecordFromIndexView = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const navigate = useNavigateApp();
  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const currentRecordFilters = useRecoilComponentCallbackStateV2(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const currentRecordSorts = useRecoilComponentCallbackStateV2(
    currentRecordSortsComponentState,
    recordIndexId,
  );

  const currentRecordFilterGroups = useRecoilComponentCallbackStateV2(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  const openRecordFromIndexView = useRecoilCallback(
    ({ snapshot, set }) =>
      ({ recordId }: { recordId: string }) => {
        const recordIndexOpenRecordIn = snapshot
          .getLoadable(recordIndexOpenRecordInState)
          .getValue();

        const parentViewFilters = snapshot
          .getLoadable(currentRecordFilters)
          .getValue();

        const parentViewSorts = snapshot
          .getLoadable(currentRecordSorts)
          .getValue();

        const parentViewFilterGroups = snapshot
          .getLoadable(currentRecordFilterGroups)
          .getValue();

        set(
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
          recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL &&
          canOpenObjectInSidePanel(objectNameSingular)
        ) {
          openRecordInCommandMenu({
            recordId,
            objectNameSingular,
            resetNavigationStack: true,
          });
        } else {
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
    ],
  );

  return { openRecordFromIndexView };
};
