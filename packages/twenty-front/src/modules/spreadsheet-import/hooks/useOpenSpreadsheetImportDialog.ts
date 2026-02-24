import { SPREADSHEET_IMPORT_MODAL_ID } from '@/spreadsheet-import/constants/SpreadsheetImportModalId';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';

export const useOpenSpreadsheetImportDialog = () => {
  const setSpreadSheetImport = useSetRecoilStateV2(
    spreadsheetImportDialogState,
  );

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
