import { SPREADSHEET_IMPORT_MODAL_ID } from '@/spreadsheet-import/constants/SpreadsheetImportModalId';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useOpenSpreadsheetImportDialog = () => {
  const setSpreadSheetImport = useSetAtomState(spreadsheetImportDialogState);

  const { openModal } = useModal();

  const openSpreadsheetImportDialog = (
    options: Omit<SpreadsheetImportDialogOptions, 'isOpen' | 'onClose'>,
  ) => {
    openModal(SPREADSHEET_IMPORT_MODAL_ID);
    setSpreadSheetImport({
      isOpen: true,
      isStepBarVisible: true,
      options,
    });
  };

  return { openSpreadsheetImportDialog };
};
