import { useRecoilCallback } from 'recoil';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { isSoftFocusActiveComponentState } from '@/object-record/record-table/states/isSoftFocusActiveComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export const useLeaveTableFocus = (recordTableId?: string) => {
  const disableSoftFocus = useDisableSoftFocus(recordTableId);

  const isSoftFocusActiveState = useRecoilComponentCallbackStateV2(
    isSoftFocusActiveComponentState,
    recordTableId,
  );

  const resetTableRowSelection = useResetTableRowSelection(recordTableId);

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isSoftFocusActive = getSnapshotValue(
          snapshot,
          isSoftFocusActiveState,
        );

        resetTableRowSelection();

        if (!isSoftFocusActive) {
          return;
        }

        disableSoftFocus();
      },
    [disableSoftFocus, isSoftFocusActiveState, resetTableRowSelection],
  );
};
