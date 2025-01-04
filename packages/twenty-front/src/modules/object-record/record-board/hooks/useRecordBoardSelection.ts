import { useRecoilCallback } from 'recoil';

import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const useRecordBoardSelection = (recordBoardId: string) => {
  const isRecordBoardCardSelectedFamilyState =
    useRecoilComponentCallbackStateV2(
      isRecordBoardCardSelectedComponentFamilyState,
      recordBoardId,
    );

  const recordBoardSelectedRecordIdsSelector =
    useRecoilComponentCallbackStateV2(
      recordBoardSelectedRecordIdsComponentSelector,
      recordBoardId,
    );

  const isActionMenuDropdownOpenState = extractComponentState(
    isDropdownOpenComponentState,
    getActionMenuDropdownIdFromActionMenuId(
      getActionMenuIdFromRecordIndexId(recordBoardId),
    ),
  );

  const resetRecordSelection = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        set(isActionMenuDropdownOpenState, false);

        const recordIds = getSnapshotValue(
          snapshot,
          recordBoardSelectedRecordIdsSelector,
        );

        for (const recordId of recordIds) {
          set(isRecordBoardCardSelectedFamilyState(recordId), false);
        }
      },
    [
      isActionMenuDropdownOpenState,
      recordBoardSelectedRecordIdsSelector,
      isRecordBoardCardSelectedFamilyState,
    ],
  );

  const setRecordAsSelected = useRecoilCallback(
    ({ snapshot, set }) =>
      (recordId: string, isSelected: boolean) => {
        const isRecordCurrentlySelected = snapshot
          .getLoadable(isRecordBoardCardSelectedFamilyState(recordId))
          .getValue();

        if (isRecordCurrentlySelected === isSelected) {
          return;
        }

        set(isRecordBoardCardSelectedFamilyState(recordId), isSelected);
      },
    [isRecordBoardCardSelectedFamilyState],
  );

  const checkIfLastUnselectAndCloseDropdown = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const recordIds = getSnapshotValue(
          snapshot,
          recordBoardSelectedRecordIdsSelector,
        );
        if (recordIds.length === 0) {
          set(isActionMenuDropdownOpenState, false);
        }
      },
    [recordBoardSelectedRecordIdsSelector, isActionMenuDropdownOpenState],
  );

  return {
    resetRecordSelection,
    setRecordAsSelected,
    checkIfLastUnselectAndCloseDropdown,
  };
};
