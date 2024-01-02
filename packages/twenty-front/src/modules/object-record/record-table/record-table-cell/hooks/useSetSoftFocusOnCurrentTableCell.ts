import { useRecoilCallback } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useSetSoftFocusOnCurrentTableCell = () => {
  const { setSoftFocusPosition } = useRecordTable();

  const { isSoftFocusActiveScopeInjector } = getRecordTableScopeInjector();

  const { injectStateWithRecordTableScopeId } = useRecordTableScopedStates();

  const isSoftFocusActiveState = injectStateWithRecordTableScopeId(
    isSoftFocusActiveScopeInjector,
  );

  const currentTableCellPosition = useCurrentTableCellPosition();

  const setHotkeyScope = useSetHotkeyScope();

  return useRecoilCallback(
    ({ set }) =>
      () => {
        setSoftFocusPosition(currentTableCellPosition);

        set(isSoftFocusActiveState, true);

        setHotkeyScope(TableHotkeyScope.TableSoftFocus);
      },
    [
      setSoftFocusPosition,
      currentTableCellPosition,
      isSoftFocusActiveState,
      setHotkeyScope,
    ],
  );
};
