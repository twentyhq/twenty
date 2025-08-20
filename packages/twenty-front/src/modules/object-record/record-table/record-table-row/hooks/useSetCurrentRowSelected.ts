import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { lastSelectedRowIndexComponentState } from '@/object-record/record-table/record-table-row/states/lastSelectedRowIndexComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from 'twenty-shared/utils';

export const useSetCurrentRowSelected = () => {
  const { recordId, rowIndex } = useRecordTableRowContextOrThrow();
  const isRowSelectedFamilyState = useRecoilComponentCallbackState(
    isRowSelectedComponentFamilyState,
  );

  const recordIndexAllRecordIdsState = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const lastSelectedRowIndexComponentCallbackState =
    useRecoilComponentCallbackState(lastSelectedRowIndexComponentState);

  const setCurrentRowSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        newSelectedState,
        shouldSelectRange = false,
      }: {
        newSelectedState: boolean;
        shouldSelectRange?: boolean;
      }) => {
        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsState,
        );

        const isCurrentRowSelected = getSnapshotValue(
          snapshot,
          isRowSelectedFamilyState(recordId),
        );

        const lastSelectedIndex = snapshot
          .getLoadable(lastSelectedRowIndexComponentCallbackState)
          .getValue();

        if (shouldSelectRange && isDefined(lastSelectedIndex)) {
          const startIndex = Math.min(lastSelectedIndex, rowIndex);
          const endIndex = Math.max(lastSelectedIndex, rowIndex);

          const shouldSelect = !isCurrentRowSelected;

          for (let i = startIndex; i <= endIndex; i++) {
            set(isRowSelectedFamilyState(allRecordIds[i]), shouldSelect);
          }

          set(lastSelectedRowIndexComponentCallbackState, rowIndex);
          return;
        }

        if (isCurrentRowSelected !== newSelectedState) {
          set(isRowSelectedFamilyState(recordId), newSelectedState);

          set(
            lastSelectedRowIndexComponentCallbackState,
            newSelectedState ? rowIndex : null,
          );
        }
      },
    [
      recordIndexAllRecordIdsState,
      isRowSelectedFamilyState,
      recordId,
      lastSelectedRowIndexComponentCallbackState,
      rowIndex,
    ],
  );

  return {
    setCurrentRowSelected,
  };
};
