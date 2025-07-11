import { ImportedStructuredRowMetadata } from '@/spreadsheet-import/steps/components/ValidationStep/types';
import { ImportedStructuredRow } from './SpreadsheetImportImportedStructuredRow';

export type SpreadsheetImportImportValidationResult = {
  validStructuredRows: ImportedStructuredRow[];
  invalidStructuredRows: ImportedStructuredRow[];
  allStructuredRows: (ImportedStructuredRow & ImportedStructuredRowMetadata)[];
};
