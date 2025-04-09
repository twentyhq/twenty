import { useRecoilCallback } from 'recoil';

import { useSetSoftFocusPosition } from '@/object-record/record-table/hooks/internal/useSetSoftFocusPosition';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { isSoftFocusActiveComponentState } from '@/object-record/record-table/states/isSoftFocusActiveComponentState';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

export const useSetSoftFocus = (recordTableId?: string) => {
  const setSoftFocusPosition = useSetSoftFocusPosition(recordTableId);

  const isSoftFocusActiveState = useRecoilComponentCallbackStateV2(
    isSoftFocusActiveComponentState,
    recordTableId,
  );

  const setHotkeyScope = useSetHotkeyScope();

  return useRecoilCallback(
    ({ snapshot, set }) =>
      (newPosition: TableCellPosition) => {
        setSoftFocusPosition(newPosition);

        set(isSoftFocusActiveState, true);

        if (
          snapshot.getLoadable(currentHotkeyScopeState).getValue().scope !==
          AppHotkeyScope.CommandMenuOpen
        ) {
          setHotkeyScope(TableHotkeyScope.TableSoftFocus);
        }
      },
    [setSoftFocusPosition, isSoftFocusActiveState, setHotkeyScope],
  );
};
