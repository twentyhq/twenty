import { useRecoilCallback } from 'recoil';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { isFocusActiveComponentState } from '@/object-record/record-table/states/isFocusActiveComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useDisableFocus } from './useDisableFocus';

export const useLeaveTableFocus = (recordTableId?: string) => {
  const recordTableIdFromContext = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const disableFocus = useDisableFocus(recordTableIdFromContext);

  const isFocusActiveState = useRecoilComponentCallbackStateV2(
    isFocusActiveComponentState,
    recordTableIdFromContext,
  );

  const resetTableRowSelection = useResetTableRowSelection(
    recordTableIdFromContext,
  );

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isFocusActive = getSnapshotValue(
          snapshot,
          isFocusActiveState,
        );

        resetTableRowSelection();

        if (!isFocusActive) {
          return;
        }

        disableFocus();
      },
    [disableFocus, isFocusActiveState, resetTableRowSelection],
  );
};
