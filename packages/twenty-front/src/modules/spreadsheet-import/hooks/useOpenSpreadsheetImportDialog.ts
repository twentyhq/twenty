import { useSetRecoilState } from 'recoil';

import { SPREADSHEET_IMPORT_MODAL_ID } from '@/spreadsheet-import/constants/SpreadsheetImportModalId';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
export const useOpenSpreadsheetImportDialog = <T extends string>() => {
  const setSpreadSheetImport = useSetRecoilState(spreadsheetImportDialogState);

  const { openModal } = useModal();

  const openSpreadsheetImportDialog = (
    options: Omit<SpreadsheetImportDialogOptions<T>, 'isOpen' | 'onClose'>,
  ) => {
    openModal(SPREADSHEET_IMPORT_MODAL_ID);
    setSpreadSheetImport({
      isOpen: true,
      options,
    });
  };

  return { openSpreadsheetImportDialog };
};
