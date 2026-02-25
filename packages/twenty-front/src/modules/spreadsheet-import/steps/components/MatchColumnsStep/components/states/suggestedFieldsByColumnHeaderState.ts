import { type SpreadsheetImportField } from '@/spreadsheet-import/types';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const suggestedFieldsByColumnHeaderState = createAtomState({
  key: 'suggestedFieldsByColumnHeaderState',
  defaultValue: {} as Record<string, SpreadsheetImportField[]>,
});
