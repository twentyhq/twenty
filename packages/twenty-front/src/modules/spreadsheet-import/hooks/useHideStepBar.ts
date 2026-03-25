import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useHideStepBar = () => {
  const store = useStore();
  const hideStepBar = useCallback(() => {
    const isStepBarVisible = store.get(
      spreadsheetImportDialogState.atom,
    ).isStepBarVisible;

    if (isStepBarVisible) {
      store.set(spreadsheetImportDialogState.atom, (state) => ({
        ...state,
        isStepBarVisible: false,
      }));
    }
  }, [store]);

  return hideStepBar;
};
