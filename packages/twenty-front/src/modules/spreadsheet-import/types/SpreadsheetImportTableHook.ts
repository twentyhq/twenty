import { ImportedStructuredRow } from './SpreadsheetImportImportedStructuredRow';
import { SpreadsheetImportInfo } from './SpreadsheetImportInfo';

export type SpreadsheetImportTableHook = (
  table: ImportedStructuredRow[],
  addError: (
    rowIndex: number,
    fieldKey: string,
    error: SpreadsheetImportInfo,
  ) => void,
) => ImportedStructuredRow[];
