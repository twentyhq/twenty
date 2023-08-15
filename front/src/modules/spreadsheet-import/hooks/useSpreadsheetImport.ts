import { useSetRecoilState } from 'recoil';

import { spreadsheetImportState } from '@/spreadsheet-import/states/spreadsheetImportState';
import { RsiProps } from '@/spreadsheet-import/types';

export function useSpreadsheetImport() {
  const setSpreadSheetImport = useSetRecoilState(spreadsheetImportState);

  const openSpreadsheetImport = (
    options: Omit<RsiProps<string>, 'isOpen' | 'onClose'>,
  ) => {
    setSpreadSheetImport({
      isOpen: true,
      options,
    });
  };

  return { openSpreadsheetImport };
}
