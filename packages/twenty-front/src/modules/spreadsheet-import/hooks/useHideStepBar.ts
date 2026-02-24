import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';

export const useHideStepBar = () => {
  const hideStepBar = useCallback(() => {
    const isStepBarVisible = jotaiStore.get(
      spreadsheetImportDialogState.atom,
    ).isStepBarVisible;

    if (isStepBarVisible) {
      jotaiStore.set(spreadsheetImportDialogState.atom, (state) => ({
        ...state,
        isStepBarVisible: false,
      }));
    }
  }, []);

  return hideStepBar;
};
