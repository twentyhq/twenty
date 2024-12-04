import { useRecoilCallback } from 'recoil';

import { currentTableCellInEditModePositionComponentState } from '@/object-record/record-table/states/currentTableCellInEditModePositionComponentState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { useGoBackToPreviouslyFocusedDropdownId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviouslyFocusedDropdown';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useCloseCurrentTableCellInEditMode = (recordTableId?: string) => {
  const currentTableCellInEditModePositionState =
    useRecoilComponentCallbackStateV2(
      currentTableCellInEditModePositionComponentState,
      recordTableId,
    );
  const isTableCellInEditModeFamilyState = useRecoilComponentCallbackStateV2(
    isTableCellInEditModeComponentFamilyState,
    recordTableId,
  );

  const { goBackToPreviouslyFocusedDropdownId } =
    useGoBackToPreviouslyFocusedDropdownId();

  return useRecoilCallback(
    ({ set, snapshot }) => {
      return async () => {
        const currentTableCellInEditModePosition = getSnapshotValue(
          snapshot,
          currentTableCellInEditModePositionState,
        );
        console.log('close table cell', currentTableCellInEditModePosition);
        set(
          isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
          false,
        );

        goBackToPreviouslyFocusedDropdownId();
      };
    },
    [
      currentTableCellInEditModePositionState,
      isTableCellInEditModeFamilyState,
      goBackToPreviouslyFocusedDropdownId,
    ],
  );
};
