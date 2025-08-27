import { type ImportedStructuredRow } from './SpreadsheetImportImportedStructuredRow';
import { type SpreadsheetImportInfo } from './SpreadsheetImportInfo';

export type SpreadsheetImportRowHook = (
  row: ImportedStructuredRow,
  addError: (fieldKey: string, error: SpreadsheetImportInfo) => void,
  table: ImportedStructuredRow[],
) => ImportedStructuredRow;
