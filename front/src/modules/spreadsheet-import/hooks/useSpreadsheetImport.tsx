import { useSetRecoilState } from 'recoil';

import { spreadsheetImportState } from '@/spreadsheet-import/states/spreadsheetImportState';
import { SpreadsheetOptions } from '@/spreadsheet-import/types';

export function useSpreadsheetImport<T extends string>() {
  const setSpreadSheetImport = useSetRecoilState(spreadsheetImportState);

  const openSpreadsheetImport = (
    options: Omit<SpreadsheetOptions<T>, 'isOpen' | 'onClose'>,
  ) => {
    setSpreadSheetImport((prevState) => ({
      ...prevState,
      isOpen: true,
      options: {
        ...options,
        onClose: () => {
          setSpreadSheetImport((prevState) => ({
            ...prevState,
            isOpen: false,
          }));
        },
      },
    }));
  };

  const closeSpreadsheetImport = () => {
    setSpreadSheetImport((prevState) => ({
      ...prevState,
      isOpen: false,
    }));
  };

  return { openSpreadsheetImport, closeSpreadsheetImport };
}
