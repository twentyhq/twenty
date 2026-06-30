import { type SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';

export const setIgnoreColumn = ({
  header,
  index,
}: SpreadsheetColumn): SpreadsheetColumn => ({
  header,
  index,
  type: SpreadsheetColumnType.ignored,
});
