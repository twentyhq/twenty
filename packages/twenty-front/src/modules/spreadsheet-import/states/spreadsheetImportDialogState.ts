import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type SpreadsheetImportDialogState = {
  isOpen: boolean;
  isStepBarVisible: boolean;
  options: Omit<SpreadsheetImportDialogOptions, 'isOpen' | 'onClose'> | null;
};

export const spreadsheetImportDialogState =
  createAtomState<SpreadsheetImportDialogState>({
    key: 'spreadsheetImportDialogState',
    defaultValue: {
      isOpen: false,
      isStepBarVisible: true,
      options: null,
    },
  });
