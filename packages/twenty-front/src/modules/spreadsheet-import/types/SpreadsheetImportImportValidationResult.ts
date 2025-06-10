import { ImportedStructuredRowMetadata } from '@/spreadsheet-import/steps/components/ValidationStep/types';
import { ImportedStructuredRow } from './SpreadsheetImportImportedStructuredRow';

export type SpreadsheetImportImportValidationResult<T extends string> = {
  validStructuredRows: ImportedStructuredRow<T>[];
  invalidStructuredRows: ImportedStructuredRow<T>[];
  allStructuredRows: (ImportedStructuredRow<T> &
    ImportedStructuredRowMetadata)[];
};
