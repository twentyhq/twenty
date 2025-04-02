import { ImportedStructuredRow } from './SpreadsheetImportImportedStructuredRow';
import { SpreadsheetImportInfo } from './SpreadsheetImportInfo';

export type SpreadsheetImportTableHook<T extends string> = (
  table: ImportedStructuredRow<T>[],
  addError: (
    rowIndex: number,
    fieldKey: T,
    error: SpreadsheetImportInfo,
  ) => void,
) => ImportedStructuredRow<T>[];
