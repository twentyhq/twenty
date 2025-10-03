import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useAssignRecordsToStore } from '@/object-record/record-table/virtualization/hooks/useAssignRecordsToStore';
import { useLoadRecordsToVirtualRows } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsToVirtualRows';
import { useReapplyRowSelection } from '@/object-record/record-table/virtualization/hooks/useReapplyRowSelection';
import { useResetNumberOfRecordsToVirtualize } from '@/object-record/record-table/virtualization/hooks/useResetNumberOfRecordsToVirtualize';
import { useResetTableFocuses } from '@/object-record/record-table/virtualization/hooks/useResetTableFocuses';
import { useResetVirtualizedRowTreadmill } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizedRowTreadmill';
import { useResetVirtualRecordTableDataLoading } from '@/object-record/record-table/virtualization/hooks/useResetVirtualRecordTableDataLoading';
import { isInitializingVirtualTableDataLoadingComponentState } from '@/object-record/record-table/virtualization/states/isInitializingVirtualTableDataLoadingComponentState';
import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useTriggerInitialRecordTableDataLoad = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const { findManyRecordsLazy } =
    useRecordIndexTableFetchMore(objectNameSingular);

  const isInitializingVirtualTableDataLoadingCallbackState =
    useRecoilComponentCallbackState(
      isInitializingVirtualTableDataLoadingComponentState,
    );

  const isRecordTableInitialLoadingCallbackState =
    useRecoilComponentCallbackState(isRecordTableInitialLoadingComponentState);

  const { scrollToPosition } = useScrollToPosition();

  const { resetVirtualizedRowTreadmill } = useResetVirtualizedRowTreadmill();
  const { resetNumberOfRecordsToVirtualize } =
    useResetNumberOfRecordsToVirtualize();

  const { resetTableFocuses } = useResetTableFocuses(recordTableId);
  const { assignRecordsToStore } = useAssignRecordsToStore();

  const { loadRecordsToVirtualRows } = useLoadRecordsToVirtualRows();

  const { reapplyRowSelection } = useReapplyRowSelection();

  const { resetRecordTableVirtualDataLoading } =
    useResetVirtualRecordTableDataLoading();

  const triggerInitialRecordTableDataLoad = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
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

        resetRecordTableVirtualDataLoading();

        scrollToPosition(0);

        const { records, totalCount } = await findManyRecordsLazy();

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

        set(isInitializingVirtualTableDataLoadingCallbackState, false);
        set(isRecordTableInitialLoadingCallbackState, false);
      },
    [
      findManyRecordsLazy,
      resetVirtualizedRowTreadmill,
      resetNumberOfRecordsToVirtualize,
      scrollToPosition,
      resetRecordTableVirtualDataLoading,
      loadRecordsToVirtualRows,
      assignRecordsToStore,
      resetTableFocuses,
      reapplyRowSelection,
      isInitializingVirtualTableDataLoadingCallbackState,
      isRecordTableInitialLoadingCallbackState,
    ],
  );

  return {
    triggerInitialRecordTableDataLoad,
  };
};
