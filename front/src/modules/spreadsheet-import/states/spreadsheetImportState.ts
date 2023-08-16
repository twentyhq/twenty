import { atom } from 'recoil';

import { RsiProps } from '../types';

export type SpreadsheetImportState<T extends string> = {
  isOpen: boolean;
  options: Omit<RsiProps<T>, 'isOpen' | 'onClose'> | null;
};

export const spreadsheetImportState = atom<SpreadsheetImportState<string>>({
  key: 'spreadsheetImportState',
  default: {
    isOpen: false,
    options: null,
  },
});
