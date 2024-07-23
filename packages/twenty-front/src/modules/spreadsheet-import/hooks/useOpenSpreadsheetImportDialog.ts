import { useSetRecoilState } from 'recoil';

import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';

export const useOpenSpreadsheetImportDialog = <T extends string>() => {
  const setSpreadSheetImport = useSetRecoilState(spreadsheetImportDialogState);

  const openSpreadsheetImportDialog = (
    options: Omit<SpreadsheetImportDialogOptions<T>, 'isOpen' | 'onClose'>,
  ) => {
    setSpreadSheetImport({
      isOpen: true,
      options,
    });
  };

  return { openSpreadsheetImportDialog };
};
