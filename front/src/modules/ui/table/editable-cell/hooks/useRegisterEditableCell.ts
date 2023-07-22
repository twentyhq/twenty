import { useEffect } from 'react';

import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';

import { useRecoilScopedState } from '../../../recoil-scope/hooks/useRecoilScopedState';
import { CellContext } from '../../states/CellContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { customCellHotkeyScopeScopedState } from '../states/customCellHotkeyScopeScopedState';

const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export function useRegisterEditableCell(cellHotkeyScope?: HotkeyScope) {
  const [, setCustomCellHotkeyScope] = useRecoilScopedState(
    customCellHotkeyScopeScopedState,
    CellContext,
  );

  useEffect(() => {
    setCustomCellHotkeyScope(cellHotkeyScope ?? DEFAULT_CELL_SCOPE);
  }, [cellHotkeyScope, setCustomCellHotkeyScope]);
}
