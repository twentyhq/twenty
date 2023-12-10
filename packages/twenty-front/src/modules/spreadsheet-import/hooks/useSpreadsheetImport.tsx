import { useSetRecoilState } from 'recoil';

import { spreadsheetImportState } from '@/spreadsheet-import/states/spreadsheetImportState';
import { SpreadsheetOptions } from '@/spreadsheet-import/types';

export const useSpreadsheetImport = <T extends string>() => {
  const setSpreadSheetImport = useSetRecoilState(spreadsheetImportState);

  const openSpreadsheetImport = (
    options: Omit<SpreadsheetOptions<T>, 'isOpen' | 'onClose'>,
  ) => {
    setSpreadSheetImport({
      isOpen: true,
      options,
    });
  };

  return { openSpreadsheetImport };
};
