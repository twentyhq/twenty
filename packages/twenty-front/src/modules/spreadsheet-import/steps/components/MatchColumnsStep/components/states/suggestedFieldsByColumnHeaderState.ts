import { SpreadsheetImportField } from '@/spreadsheet-import/types';
import { atom } from 'recoil';

export const suggestedFieldsByColumnHeaderState = atom({
  key: 'suggestedFieldsByColumnHeaderState',
  default: {} as Record<string, SpreadsheetImportField<string>[]>,
});
