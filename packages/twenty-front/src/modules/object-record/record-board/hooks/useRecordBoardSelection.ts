import { useRecoilCallback } from 'recoil';

import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const useRecordBoardSelection = (recordBoardId?: string) => {
  const instanceIdFromProps = useAvailableComponentInstanceIdOrThrow(
    RecordBoardComponentInstanceContext,
    recordBoardId,
  );

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

  const { closeDropdown } = useDropdownV2();

  const dropdownId = getActionMenuDropdownIdFromActionMenuId(
    getActionMenuIdFromRecordIndexId(instanceIdFromProps),
  );

  const resetRecordSelection = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        closeDropdown(dropdownId);

        const recordIds = getSnapshotValue(
          snapshot,
          recordBoardSelectedRecordIdsSelector,
        );

        for (const recordId of recordIds) {
          set(isRecordBoardCardSelectedFamilyState(recordId), false);
        }
      },
    [
      closeDropdown,
      dropdownId,
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
    ({ snapshot }) =>
      () => {
        const recordIds = getSnapshotValue(
          snapshot,
          recordBoardSelectedRecordIdsSelector,
        );
        if (recordIds.length === 0) {
          closeDropdown(dropdownId);
        }
      },
    [recordBoardSelectedRecordIdsSelector, closeDropdown, dropdownId],
  );

  return {
    resetRecordSelection,
    setRecordAsSelected,
    checkIfLastUnselectAndCloseDropdown,
  };
};
