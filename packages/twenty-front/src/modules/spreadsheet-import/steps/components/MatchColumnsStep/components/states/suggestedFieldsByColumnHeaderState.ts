import { type SpreadsheetImportField } from '@/spreadsheet-import/types';
import { createState } from 'twenty-ui/utilities';

export const suggestedFieldsByColumnHeaderState = createState({
  key: 'suggestedFieldsByColumnHeaderState',
  defaultValue: {} as Record<string, SpreadsheetImportField[]>,
});
