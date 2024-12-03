import { useRecoilCallback } from 'recoil';

import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { currentTableCellInEditModePositionComponentState } from '@/object-record/record-table/states/currentTableCellInEditModePositionComponentState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetSoftFocusOnCurrentTableCell } from './useSetSoftFocusOnCurrentTableCell';

export const useMoveSoftFocusToCurrentCellOnHover = () => {
  const setSoftFocusOnCurrentTableCell = useSetSoftFocusOnCurrentTableCell();

  const currentTableCellInEditModePositionState =
    useRecoilComponentCallbackStateV2(
      currentTableCellInEditModePositionComponentState,
    );
  const isTableCellInEditModeFamilyState = useRecoilComponentCallbackStateV2(
    isTableCellInEditModeComponentFamilyState,
  );

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentTableCellInEditModePosition = getSnapshotValue(
          snapshot,
          currentTableCellInEditModePositionState,
        );

        const isSomeCellInEditMode = snapshot
          .getLoadable(
            isTableCellInEditModeFamilyState(
              currentTableCellInEditModePosition,
            ),
          )
          .getValue();

        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .getValue();

        if (
          currentHotkeyScope.scope !== TableHotkeyScope.TableSoftFocus &&
          currentHotkeyScope.scope !== TableHotkeyScope.CellEditMode &&
          currentHotkeyScope.scope !== TableHotkeyScope.Table
        ) {
          return;
        }

        if (!isSomeCellInEditMode) {
          setSoftFocusOnCurrentTableCell();
        }
      },
    [
      currentTableCellInEditModePositionState,
      isTableCellInEditModeFamilyState,
      setSoftFocusOnCurrentTableCell,
    ],
  );
};
