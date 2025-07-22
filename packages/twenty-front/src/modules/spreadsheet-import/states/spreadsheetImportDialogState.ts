import { createState } from 'twenty-ui/utilities';
import { SpreadsheetImportDialogOptions } from '../types';

export type SpreadsheetImportDialogState<T extends string> = {
  isOpen: boolean;
  isStepBarVisible: boolean;
  options: Omit<SpreadsheetImportDialogOptions<T>, 'isOpen' | 'onClose'> | null;
};

export const spreadsheetImportDialogState = createState<
  SpreadsheetImportDialogState<any>
>({
  key: 'spreadsheetImportDialogState',
  defaultValue: {
    isOpen: false,
    isStepBarVisible: true,
    options: null,
  },
});
