import { useAppFocus } from '@/app-focus/hooks/useAppFocus';

import { useClearCellInEditMode } from './useClearCellInEditMode';
import { useDisableSoftFocus } from './useDisableSoftFocus';

export function useLeaveTableFocus() {
  const { removeAppFocus, appFocus } = useAppFocus();
  const disableSoftFocus = useDisableSoftFocus();
  const clearCellInEditMode = useClearCellInEditMode();

  return async function leaveTableFocus() {
    if (appFocus === 'table-cell') {
      clearCellInEditMode();

      removeAppFocus('table-cell');
    } else if (appFocus === 'table-body') {
      removeAppFocus('table-body');

      disableSoftFocus();
    }
  };
}
