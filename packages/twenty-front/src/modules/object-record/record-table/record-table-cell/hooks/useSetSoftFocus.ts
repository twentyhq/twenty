import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

export const useSetSoftFocus = () => {
  const { setSoftFocusPosition } = useRecordTable();

  const { getIsSoftFocusActiveState } = useRecordTableStates();

  const setHotkeyScope = useSetHotkeyScope();

  return useRecoilCallback(
    ({ set }) =>
      (newPosition: TableCellPosition) => {
        setSoftFocusPosition(newPosition);

        set(getIsSoftFocusActiveState(), true);

        setHotkeyScope(TableHotkeyScope.TableSoftFocus);
      },
    [setSoftFocusPosition, getIsSoftFocusActiveState, setHotkeyScope],
  );
};
