import { createState } from 'twenty-ui/utilities';
import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';

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
