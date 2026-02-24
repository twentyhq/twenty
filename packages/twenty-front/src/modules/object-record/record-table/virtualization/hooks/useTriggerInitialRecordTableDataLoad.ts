import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableHorizontalScrollShadowVisibilityCssVariableName';
import { RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableVerticalScrollShadowVisibilityCssVariableName';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useScrollTableToPosition } from '@/object-record/record-table/hooks/useScrollTableToPosition';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';
import { useLoadRecordsToVirtualRows } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsToVirtualRows';
import { useReapplyRowSelection } from '@/object-record/record-table/virtualization/hooks/useReapplyRowSelection';

import { useResetTableFocuses } from '@/object-record/record-table/virtualization/hooks/useResetTableFocuses';
import { useResetVirtualizedRowTreadmill } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizedRowTreadmill';
import { dataPagesLoadedComponentState } from '@/object-record/record-table/virtualization/states/dataPagesLoadedComponentState';
import { isInitializingVirtualTableDataLoadingComponentState } from '@/object-record/record-table/virtualization/states/isInitializingVirtualTableDataLoadingComponentState';
import { lastRealIndexSetComponentState } from '@/object-record/record-table/virtualization/states/lastRealIndexSetComponentState';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { scrollAtRealIndexComponentState } from '@/object-record/record-table/virtualization/states/scrollAtRealIndexComponentState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SIGN_IN_BACKGROUND_MOCK_COMPANIES } from '@/sign-in-background-mock/constants/SignInBackgroundMockCompanies';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { dataLoadingStatusByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentState';
import { recordIdByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { isDefined } from 'twenty-shared/utils';

export const useTriggerInitialRecordTableDataLoad = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const showAuthModal = useShowAuthModal();

  const { findManyRecordsLazy } =
    useRecordIndexTableFetchMore(objectNameSingular);

  const isInitializingVirtualTableDataLoadingCallbackState =
    useRecoilComponentStateCallbackStateV2(
      isInitializingVirtualTableDataLoadingComponentState,
    );

  const dataPagesLoadedCallbackState = useRecoilComponentStateCallbackStateV2(
    dataPagesLoadedComponentState,
  );

  const isRecordTableInitialLoading = useRecoilComponentStateCallbackStateV2(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const recordIndexAllRecordIds = useRecoilComponentSelectorCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const recordIdByRealIndexCallbackState =
    useRecoilComponentStateCallbackStateV2(recordIdByRealIndexComponentState);

  const dataLoadingStatusByRealIndexCallbackState =
    useRecoilComponentStateCallbackStateV2(
      dataLoadingStatusByRealIndexComponentState,
    );

  const setIsRecordTableScrolledHorizontally = useSetRecoilComponentStateV2(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const setIsRecordTableScrolledVertically = useSetRecoilComponentStateV2(
    isRecordTableScrolledVerticallyComponentState,
  );

  const lastScrollPositionCallbackState =
    useRecoilComponentStateCallbackStateV2(lastScrollPositionComponentState);

  const lastRealIndexSetCallbackState = useRecoilComponentStateCallbackStateV2(
    lastRealIndexSetComponentState,
  );

  const scrollAtRealIndexCallbackState = useRecoilComponentStateCallbackStateV2(
    scrollAtRealIndexComponentState,
  );

  const { scrollTableToPosition } = useScrollTableToPosition();

  const { resetVirtualizedRowTreadmill } = useResetVirtualizedRowTreadmill();

  const { resetTableFocuses } = useResetTableFocuses(recordTableId);
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { loadRecordsToVirtualRows } = useLoadRecordsToVirtualRows();

  const { reapplyRowSelection } = useReapplyRowSelection();

  const totalNumberOfRecordsToVirtualizeCallbackState =
    useRecoilComponentStateCallbackStateV2(
      totalNumberOfRecordsToVirtualizeComponentState,
    );

  const triggerInitialRecordTableDataLoad = useCallback(
    async ({
      shouldScrollToStart = true,
    }: { shouldScrollToStart?: boolean } = {}) => {
      const isInitializingVirtualTableDataLoading = store.get(
        isInitializingVirtualTableDataLoadingCallbackState,
      );

      if (isInitializingVirtualTableDataLoading) {
        return;
      }

      store.set(isInitializingVirtualTableDataLoadingCallbackState, true);

      resetTableFocuses();

      resetVirtualizedRowTreadmill();

      updateRecordTableCSSVariable(
        RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME,
        'hidden',
      );

      updateRecordTableCSSVariable(
        RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME,
        'hidden',
      );

      const currentRecordIds = store.get(recordIndexAllRecordIds);

      let records: ObjectRecord[] | null = null;
      let totalCount = 0;

      if (showAuthModal) {
        records = SIGN_IN_BACKGROUND_MOCK_COMPANIES;
        totalCount = SIGN_IN_BACKGROUND_MOCK_COMPANIES.length;
      } else {
        const newRecordIdByRealIndex = new Map(
          store.get(recordIdByRealIndexCallbackState),
        );
        const newDataLoadingStatusByRealIndex = new Map(
          store.get(dataLoadingStatusByRealIndexCallbackState),
        );

        for (const [realIndex] of currentRecordIds.entries()) {
          newDataLoadingStatusByRealIndex.set(realIndex, 'not-loaded');
          newRecordIdByRealIndex.delete(realIndex);
        }

        store.set(recordIdByRealIndexCallbackState, newRecordIdByRealIndex);
        store.set(
          dataLoadingStatusByRealIndexCallbackState,
          newDataLoadingStatusByRealIndex,
        );

        const { records: findManyRecords, totalCount: findManyTotalCount } =
          await findManyRecordsLazy();

        records = findManyRecords;
        totalCount = findManyTotalCount;
      }

      store.set(totalNumberOfRecordsToVirtualizeCallbackState, totalCount);

      if (isDefined(records)) {
        upsertRecordsInStore({ partialRecords: records });

        loadRecordsToVirtualRows({
          records,
          startingRealIndex: 0,
        });

        reapplyRowSelection();
      }

      store.set(dataPagesLoadedCallbackState, []);

      store.set(isInitializingVirtualTableDataLoadingCallbackState, false);
      store.set(isRecordTableInitialLoading, false);

      store.set(lastScrollPositionCallbackState, 0);
      store.set(lastRealIndexSetCallbackState, null);
      store.set(scrollAtRealIndexCallbackState, 0);

      setIsRecordTableScrolledHorizontally(false);
      setIsRecordTableScrolledVertically(false);
      resetTableFocuses();

      if (shouldScrollToStart) {
        scrollTableToPosition({
          horizontalScrollInPx: 0,
          verticalScrollInPx: 0,
        });
      }
    },
    [
      isInitializingVirtualTableDataLoadingCallbackState,
      resetTableFocuses,
      resetVirtualizedRowTreadmill,
      recordIndexAllRecordIds,
      store,
      showAuthModal,
      dataPagesLoadedCallbackState,
      isRecordTableInitialLoading,
      lastScrollPositionCallbackState,
      lastRealIndexSetCallbackState,
      scrollAtRealIndexCallbackState,
      setIsRecordTableScrolledHorizontally,
      setIsRecordTableScrolledVertically,
      scrollTableToPosition,
      findManyRecordsLazy,
      dataLoadingStatusByRealIndexCallbackState,
      recordIdByRealIndexCallbackState,
      totalNumberOfRecordsToVirtualizeCallbackState,
      upsertRecordsInStore,
      loadRecordsToVirtualRows,
      reapplyRowSelection,
    ],
  );

  return {
    triggerInitialRecordTableDataLoad,
  };
};
