import { SPREADSHEET_IMPORT_MODAL_ID } from '@/spreadsheet-import/constants/SpreadsheetImportModalId';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useOpenSpreadsheetImportDialog = () => {
  const setSpreadsheetImportDialog = useSetAtomState(
    spreadsheetImportDialogState,
  );

  const { openDialog } = useDialog();

  const openSpreadsheetImportDialog = (
    options: Omit<SpreadsheetImportDialogOptions, 'isOpen' | 'onClose'>,
  ) => {
    openDialog(SPREADSHEET_IMPORT_MODAL_ID);
    setSpreadsheetImportDialog({
      isOpen: true,
      isStepBarVisible: true,
      options,
    });
  };

  return { openSpreadsheetImportDialog };
};
