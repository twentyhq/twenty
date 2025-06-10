import { SpreadsheetImportDialogOptions } from '../types';
import { createState } from 'twenty-ui/utilities';

export type SpreadsheetImportDialogState<T extends string> = {
  isOpen: boolean;
  options: Omit<SpreadsheetImportDialogOptions<T>, 'isOpen' | 'onClose'> | null;
};

export const spreadsheetImportDialogState = createState<
  SpreadsheetImportDialogState<any>
>({
  key: 'spreadsheetImportDialogState',
  defaultValue: {
    isOpen: false,
    options: null,
  },
});
