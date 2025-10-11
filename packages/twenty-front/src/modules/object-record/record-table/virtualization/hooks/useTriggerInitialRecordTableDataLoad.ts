import { currentUserState } from '@/auth/states/currentUserState';
import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RECORD_TABLE_HORIZONTAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableHorizontalScrollShadowVisibilityCssVariableName';
import { RECORD_TABLE_VERTICAL_SCROLL_SHADOW_VISIBILITY_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableVerticalScrollShadowVisibilityCssVariableName';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useScrollTableToPosition } from '@/object-record/record-table/hooks/useScrollTableToPosition';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { updateRecordTableCSSVariable } from '@/object-record/record-table/utils/updateRecordTableCSSVariable';
import { useAssignRecordsToStore } from '@/object-record/record-table/virtualization/hooks/useAssignRecordsToStore';
import { useLoadRecordsToVirtualRows } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsToVirtualRows';
import { useReapplyRowSelection } from '@/object-record/record-table/virtualization/hooks/useReapplyRowSelection';
import { useResetNumberOfRecordsToVirtualize } from '@/object-record/record-table/virtualization/hooks/useResetNumberOfRecordsToVirtualize';
import { useResetTableFocuses } from '@/object-record/record-table/virtualization/hooks/useResetTableFocuses';
import { useResetVirtualizedRowTreadmill } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizedRowTreadmill';
import { dataLoadingStatusByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentFamilyState';
import { dataPagesLoadedComponentState } from '@/object-record/record-table/virtualization/states/dataPagesLoadedComponentState';
import { isInitializingVirtualTableDataLoadingComponentState } from '@/object-record/record-table/virtualization/states/isInitializingVirtualTableDataLoadingComponentState';
import { lastRealIndexSetComponentState } from '@/object-record/record-table/virtualization/states/lastRealIndexSetComponentState';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { scrollAtRealIndexComponentState } from '@/object-record/record-table/virtualization/states/scrollAtRealIndexComponentState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SIGN_IN_BACKGROUND_MOCK_COMPANIES } from '@/sign-in-background-mock/constants/SignInBackgroundMockCompanies';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useTriggerInitialRecordTableDataLoad = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const { findManyRecordsLazy } =
    useRecordIndexTableFetchMore(objectNameSingular);

  const isInitializingVirtualTableDataLoadingCallbackState =
    useRecoilComponentCallbackState(
      isInitializingVirtualTableDataLoadingComponentState,
    );

  const dataPagesLoadedCallbackState = useRecoilComponentCallbackState(
    dataPagesLoadedComponentState,
  );

  const isRecordTableInitialLoadingCallbackState =
    useRecoilComponentCallbackState(isRecordTableInitialLoadingComponentState);

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const recordIdByRealIndexCallbackState =
    useRecoilComponentFamilyCallbackState(
      recordIdByRealIndexComponentFamilyState,
    );

  const dataLoadingStatusByRealIndexCallbackState =
    useRecoilComponentCallbackState(
      dataLoadingStatusByRealIndexComponentFamilyState,
    );

  const setIsRecordTableScrolledHorizontally = useSetRecoilComponentState(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const setIsRecordTableScrolledVertically = useSetRecoilComponentState(
    isRecordTableScrolledVerticallyComponentState,
  );

  const lastScrollPositionCallbackState = useRecoilComponentCallbackState(
    lastScrollPositionComponentState,
  );

  const lastRealIndexSetCallbackState = useRecoilComponentCallbackState(
    lastRealIndexSetComponentState,
  );

  const scrollAtRealIndexCallbackState = useRecoilComponentCallbackState(
    scrollAtRealIndexComponentState,
  );

  const { scrollTableToPosition } = useScrollTableToPosition();

  const { resetVirtualizedRowTreadmill } = useResetVirtualizedRowTreadmill();
  const { resetNumberOfRecordsToVirtualize } =
    useResetNumberOfRecordsToVirtualize();

  const { resetTableFocuses } = useResetTableFocuses(recordTableId);
  const { assignRecordsToStore } = useAssignRecordsToStore();

  const { loadRecordsToVirtualRows } = useLoadRecordsToVirtualRows();

  const { reapplyRowSelection } = useReapplyRowSelection();

  const triggerInitialRecordTableDataLoad = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const currentUser = getSnapshotValue(snapshot, currentUserState);

        const isInitializingVirtualTableDataLoading = getSnapshotValue(
          snapshot,
          isInitializingVirtualTableDataLoadingCallbackState,
        );

        if (isInitializingVirtualTableDataLoading) {
          return;
        }

        set(isInitializingVirtualTableDataLoadingCallbackState, true);

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

        const currentRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );

        let records: ObjectRecord[] | null = null;
        let totalCount = 0;

        if (isUndefinedOrNull(currentUser)) {
          records = SIGN_IN_BACKGROUND_MOCK_COMPANIES;
          totalCount = SIGN_IN_BACKGROUND_MOCK_COMPANIES.length;
        } else {
          for (const [index] of currentRecordIds.entries()) {
            set(
              dataLoadingStatusByRealIndexCallbackState({
                realIndex: index,
              }),
              null,
            );

            set(
              recordIdByRealIndexCallbackState({
                realIndex: index,
              }),
              null,
            );
          }
          const { records: findManyRecords, totalCount: findManyTotalCount } =
            await findManyRecordsLazy();
          records = findManyRecords;
          totalCount = findManyTotalCount;
        }

        if (isDefined(records)) {
          resetNumberOfRecordsToVirtualize({
            records,
            totalCount,
          });

          assignRecordsToStore({ records });

          loadRecordsToVirtualRows({
            records,
            startingRealIndex: 0,
          });

          reapplyRowSelection();
        }

        set(dataPagesLoadedCallbackState, []);

        set(isInitializingVirtualTableDataLoadingCallbackState, false);
        set(isRecordTableInitialLoadingCallbackState, false);

        set(lastScrollPositionCallbackState, 0);
        set(lastRealIndexSetCallbackState, null);
        set(scrollAtRealIndexCallbackState, 0);

        setIsRecordTableScrolledHorizontally(false);
        setIsRecordTableScrolledVertically(false);

        scrollTableToPosition({
          horizontalScrollInPx: 0,
          verticalScrollInPx: 0,
        });
      },
    [
      isInitializingVirtualTableDataLoadingCallbackState,
      resetTableFocuses,
      resetVirtualizedRowTreadmill,
      recordIndexAllRecordIdsSelector,
      findManyRecordsLazy,
      dataPagesLoadedCallbackState,
      isRecordTableInitialLoadingCallbackState,
      lastScrollPositionCallbackState,
      lastRealIndexSetCallbackState,
      scrollAtRealIndexCallbackState,
      setIsRecordTableScrolledHorizontally,
      setIsRecordTableScrolledVertically,
      scrollTableToPosition,
      dataLoadingStatusByRealIndexCallbackState,
      recordIdByRealIndexCallbackState,
      resetNumberOfRecordsToVirtualize,
      assignRecordsToStore,
      loadRecordsToVirtualRows,
      reapplyRowSelection,
    ],
  );

  return {
    triggerInitialRecordTableDataLoad,
  };
};
