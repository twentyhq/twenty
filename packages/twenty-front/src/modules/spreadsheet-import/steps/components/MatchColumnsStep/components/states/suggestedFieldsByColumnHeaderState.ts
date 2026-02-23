import { type SpreadsheetImportField } from '@/spreadsheet-import/types';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const suggestedFieldsByColumnHeaderState = createStateV2({
  key: 'suggestedFieldsByColumnHeaderState',
  defaultValue: {} as Record<string, SpreadsheetImportField[]>,
});
