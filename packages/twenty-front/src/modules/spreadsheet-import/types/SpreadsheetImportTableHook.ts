import { type ImportedStructuredRow } from './SpreadsheetImportImportedStructuredRow';
import { type SpreadsheetImportInfo } from './SpreadsheetImportInfo';

export type SpreadsheetImportTableHook = (
  table: ImportedStructuredRow[],
  addError: (
    rowIndex: number,
    fieldKey: string,
    error: SpreadsheetImportInfo,
  ) => void,
) => ImportedStructuredRow[];
