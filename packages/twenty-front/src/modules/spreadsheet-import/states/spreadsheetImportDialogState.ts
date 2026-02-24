import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export type SpreadsheetImportDialogState = {
  isOpen: boolean;
  isStepBarVisible: boolean;
  options: Omit<SpreadsheetImportDialogOptions, 'isOpen' | 'onClose'> | null;
};

export const spreadsheetImportDialogState =
  createStateV2<SpreadsheetImportDialogState>({
    key: 'spreadsheetImportDialogState',
    defaultValue: {
      isOpen: false,
      isStepBarVisible: true,
      options: null,
    },
  });
