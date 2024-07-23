import { useSetRecoilState } from 'recoil';

import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { SpreadsheetOptions } from '@/spreadsheet-import/types';

export const useOpenSpreadsheetImportDialog = <T extends string>() => {
  const setSpreadSheetImport = useSetRecoilState(spreadsheetImportDialogState);

  const openSpreadsheetImportDialog = (
    options: Omit<SpreadsheetOptions<T>, 'isOpen' | 'onClose'>,
  ) => {
    setSpreadSheetImport({
      isOpen: true,
      options,
    });
  };

  return { openSpreadsheetImportDialog };
};
