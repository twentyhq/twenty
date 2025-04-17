import { useRecoilCallback } from 'recoil';

import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { isSomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/isSomeCellInEditModeComponentSelector';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

export const useMoveHoverToCurrentCell = (recordTableId: string) => {
  const setHoverPosition = useSetRecoilComponentStateV2(
    recordTableHoverPositionComponentState,
    recordTableId,
  );

  const isSomeCellInEditModeSelector = useRecoilComponentCallbackStateV2(
    isSomeCellInEditModeComponentSelector,
    recordTableId,
  );

  const moveHoverToCurrentCell = useRecoilCallback(
    ({ snapshot }) =>
      (cellPosition: TableCellPosition) => {
        const isSomeCellInEditMode = getSnapshotValue(
          snapshot,
          isSomeCellInEditModeSelector,
        );

        const currentHotkeyScope = getSnapshotValue(
          snapshot,
          currentHotkeyScopeState,
        );

        if (
          currentHotkeyScope.scope !== TableHotkeyScope.TableFocus &&
          currentHotkeyScope.scope !== TableHotkeyScope.CellEditMode &&
          currentHotkeyScope.scope !== TableHotkeyScope.Table &&
          currentHotkeyScope.scope !== AppHotkeyScope.CommandMenuOpen
        ) {
          return;
        }

        if (!isSomeCellInEditMode) {
          setHoverPosition(cellPosition);
        }
      },
    [isSomeCellInEditModeSelector, setHoverPosition],
  );

  return { moveHoverToCurrentCell };
};
