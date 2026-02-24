import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export type SpreadsheetImportDialogState = {
  isOpen: boolean;
  isStepBarVisible: boolean;
  options: Omit<SpreadsheetImportDialogOptions, 'isOpen' | 'onClose'> | null;
};

export const spreadsheetImportDialogState =
  createState<SpreadsheetImportDialogState>({
    key: 'spreadsheetImportDialogState',
    defaultValue: {
      isOpen: false,
      isStepBarVisible: true,
      options: null,
    },
  });
