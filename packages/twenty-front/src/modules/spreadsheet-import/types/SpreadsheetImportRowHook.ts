import { ImportedStructuredRow } from './SpreadsheetImportImportedStructuredRow';
import { SpreadsheetImportInfo } from './SpreadsheetImportInfo';

export type SpreadsheetImportRowHook = (
  row: ImportedStructuredRow,
  addError: (fieldKey: string, error: SpreadsheetImportInfo) => void,
  table: ImportedStructuredRow[],
) => ImportedStructuredRow;
