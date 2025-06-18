import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { useRecoilCallback } from 'recoil';

export const useHideStepBar = () => {
  const hideStepBar = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const isStepBarVisible = snapshot
          .getLoadable(spreadsheetImportDialogState)
          .getValue().isStepBarVisible;

        if (isStepBarVisible) {
          set(spreadsheetImportDialogState, (state) => ({
            ...state,
            isStepBarVisible: false,
          }));
        }
      },
    [],
  );

  return hideStepBar;
};
