import { useRecoilCallback } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useCloseCurrentTableCellInEditMode } from './useCloseCurrentTableCellInEditMode';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export const useLeaveTableFocus = (recordTableScopeId: string) => {
  const disableSoftFocus = useDisableSoftFocus(recordTableScopeId);
  const closeCurrentCellInEditMode =
    useCloseCurrentTableCellInEditMode(recordTableScopeId);

  const { isSoftFocusActiveScopeInjector } = getRecordTableScopeInjector();

  const { injectSnapshotValueWithRecordTableScopeId } =
    useRecordTableScopedStates(recordTableScopeId);

  return useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isSoftFocusActive = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          isSoftFocusActiveScopeInjector,
        );

        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .valueOrThrow();

        if (!isSoftFocusActive) {
          return;
        }

        if (currentHotkeyScope?.scope === TableHotkeyScope.Table) {
          return;
        }

        closeCurrentCellInEditMode();
        disableSoftFocus();
      },
    [
      closeCurrentCellInEditMode,
      disableSoftFocus,
      injectSnapshotValueWithRecordTableScopeId,
      isSoftFocusActiveScopeInjector,
    ],
  );
};
