import { type SpreadsheetImportInfo } from '@/spreadsheet-import/types';

export type ImportedStructuredRowMetadata = {
  __index: string;
  __errors?: Error | null;
};
export type Error = { [key: string]: SpreadsheetImportInfo };
export type Errors = { [id: string]: Error };
