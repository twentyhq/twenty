import { ImportedStructuredRow } from './SpreadsheetImportImportedStructuredRow';
import { SpreadsheetImportInfo } from './SpreadsheetImportInfo';

export type SpreadsheetImportRowHook<T extends string> = (
  row: ImportedStructuredRow<T>,
  addError: (fieldKey: T, error: SpreadsheetImportInfo) => void,
  table: ImportedStructuredRow<T>[],
) => ImportedStructuredRow<T>;
