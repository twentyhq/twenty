import { createState } from 'twenty-ui';

import { SpreadsheetOptions } from '../types';

export type SpreadsheetImportDialogState<T extends string> = {
  isOpen: boolean;
  options: Omit<SpreadsheetOptions<T>, 'isOpen' | 'onClose'> | null;
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
