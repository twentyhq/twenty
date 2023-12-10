import { atom } from 'recoil';

import { SpreadsheetOptions } from '../types';

export type SpreadsheetImportState<T extends string> = {
  isOpen: boolean;
  options: Omit<SpreadsheetOptions<T>, 'isOpen' | 'onClose'> | null;
};

export const spreadsheetImportState = atom<SpreadsheetImportState<any>>({
  key: 'spreadsheetImportState',
  default: {
    isOpen: false,
    options: null,
  },
});
