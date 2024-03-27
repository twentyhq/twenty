import { createState } from 'twenty-ui';

import { SpreadsheetOptions } from '../types';

export type SpreadsheetImportState<T extends string> = {
  isOpen: boolean;
  options: Omit<SpreadsheetOptions<T>, 'isOpen' | 'onClose'> | null;
};

export const spreadsheetImportState = createState<SpreadsheetImportState<any>>({
  key: 'spreadsheetImportState',
  defaultValue: {
    isOpen: false,
    options: null,
  },
});
