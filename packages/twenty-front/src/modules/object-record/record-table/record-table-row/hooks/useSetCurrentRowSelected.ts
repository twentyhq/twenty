import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { viewableRecordIdSelectedState } from '@/object-record/record-table/record-table-row/states/viewableRecordIdSelectedState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useSetCurrentRowSelected = () => {
  const { recordId, rowIndex } = useRecordTableRowContextOrThrow();
  const isRowSelectedFamilyState = useRecoilComponentCallbackStateV2(
    isRowSelectedComponentFamilyState,
  );

  const allRecordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const setCurrentRowSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      (
        newSelectedState: boolean,
        event?:
          | React.MouseEvent<HTMLDivElement>
          | React.KeyboardEvent<HTMLDivElement>,
      ) => {
        const isRowSelected = getSnapshotValue(
          snapshot,
          isRowSelectedFamilyState(recordId),
        );
        const lastRecordSelectedId = snapshot
          .getLoadable(viewableRecordIdSelectedState)
          .getValue();

        const lastRowIndex = allRecordIds.findIndex(
          (recordId) => recordId === lastRecordSelectedId,
        );
        if (Boolean(event?.shiftKey) && lastRowIndex !== -1 && !isRowSelected) {
          let startIndex = Math.min(lastRowIndex, rowIndex);
          const endIndex = Math.max(lastRowIndex, rowIndex);

          while (startIndex <= endIndex) {
            const isRowSelected = getSnapshotValue(
              snapshot,
              isRowSelectedFamilyState(allRecordIds[startIndex]),
            );

            if (!isRowSelected) {
              set(isRowSelectedFamilyState(allRecordIds[startIndex]), true);
            }
            startIndex++;
          }
        } else {
          if (isRowSelected !== newSelectedState) {
            set(isRowSelectedFamilyState(recordId), newSelectedState);
          }
        }
        set(viewableRecordIdSelectedState, recordId);
      },
    [recordId, isRowSelectedFamilyState, rowIndex],
  );

  return {
    setCurrentRowSelected,
  };
};
