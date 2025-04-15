import { useRecoilCallback } from 'recoil';

import { useSetFocusPosition } from '@/object-record/record-table/hooks/internal/useSetFocusPosition';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { isFocusActiveComponentState } from '@/object-record/record-table/states/isFocusActiveComponentState';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

export const useSetFocus = (recordTableId?: string) => {
  const setFocusPosition = useSetFocusPosition(recordTableId);

  const isFocusActiveState = useRecoilComponentCallbackStateV2(
    isFocusActiveComponentState,
    recordTableId,
  );

  const setHotkeyScope = useSetHotkeyScope();

  return useRecoilCallback(
    ({ snapshot, set }) =>
      (newPosition: TableCellPosition) => {
        setFocusPosition(newPosition);

        set(isFocusActiveState, true);

        if (
          snapshot.getLoadable(currentHotkeyScopeState).getValue().scope !==
          AppHotkeyScope.CommandMenuOpen
        ) {
          setHotkeyScope(TableHotkeyScope.TableFocus);
        }
      },
    [setFocusPosition, isFocusActiveState, setHotkeyScope],
  );
};
