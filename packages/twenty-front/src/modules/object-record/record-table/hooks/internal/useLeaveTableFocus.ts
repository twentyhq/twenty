import { useRecoilCallback } from 'recoil';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { isSoftFocusActiveComponentState } from '@/object-record/record-table/states/isSoftFocusActiveComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export const useLeaveTableFocus = (recordTableId?: string) => {
  const recordTableIdFromContext = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const disableSoftFocus = useDisableSoftFocus(recordTableIdFromContext);

  const isSoftFocusActiveState = useRecoilComponentCallbackStateV2(
    isSoftFocusActiveComponentState,
    recordTableIdFromContext,
  );

  const resetTableRowSelection = useResetTableRowSelection(
    recordTableIdFromContext,
  );

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
