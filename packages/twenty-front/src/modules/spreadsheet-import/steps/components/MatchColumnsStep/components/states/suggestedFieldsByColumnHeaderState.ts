import { type SpreadsheetImportField } from '@/spreadsheet-import/types';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const suggestedFieldsByColumnHeaderState = createState({
  key: 'suggestedFieldsByColumnHeaderState',
  defaultValue: {} as Record<string, SpreadsheetImportField[]>,
});
