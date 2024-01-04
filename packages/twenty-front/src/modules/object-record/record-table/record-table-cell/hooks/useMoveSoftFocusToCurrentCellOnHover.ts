import { useRecoilCallback } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useSetSoftFocusOnCurrentTableCell } from './useSetSoftFocusOnCurrentTableCell';

export const useMoveSoftFocusToCurrentCellOnHover = () => {
  const setSoftFocusOnCurrentTableCell = useSetSoftFocusOnCurrentTableCell();

  const {
    currentTableCellInEditModePositionScopeInjector,
    isTableCellInEditModeScopeInjector,
  } = getRecordTableScopeInjector();

  const {
    injectSnapshotValueWithRecordTableScopeId,
    injectFamilyStateWithRecordTableScopeId,
  } = useRecordTableScopedStates();

  const isTableCellInEditModeFamilyState =
    injectFamilyStateWithRecordTableScopeId(isTableCellInEditModeScopeInjector);

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentTableCellInEditModePosition =
          injectSnapshotValueWithRecordTableScopeId(
            snapshot,
            currentTableCellInEditModePositionScopeInjector,
          );

        const isSomeCellInEditMode = snapshot.getLoadable(
          isTableCellInEditModeFamilyState(currentTableCellInEditModePosition),
        );

        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .valueOrThrow();

        if (
          currentHotkeyScope.scope !== TableHotkeyScope.TableSoftFocus &&
          currentHotkeyScope.scope !== TableHotkeyScope.CellEditMode &&
          currentHotkeyScope.scope !== TableHotkeyScope.Table
        ) {
          return;
        }

        if (!isSomeCellInEditMode.contents) {
          setSoftFocusOnCurrentTableCell();
        }
      },
    [
      currentTableCellInEditModePositionScopeInjector,
      injectSnapshotValueWithRecordTableScopeId,
      isTableCellInEditModeFamilyState,
      setSoftFocusOnCurrentTableCell,
    ],
  );
};
