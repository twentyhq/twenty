import { type ImportedStructuredRowMetadata } from '@/spreadsheet-import/steps/components/ValidationStep/types';
import { type ImportedRow } from '@/spreadsheet-import/types/SpreadsheetImportImportedRow';
import { type ImportedStructuredRow } from '@/spreadsheet-import/types/SpreadsheetImportImportedStructuredRow';
import { type SpreadsheetColumns } from 'twenty-shared/utils';

export type SpreadsheetImportServerRowsPage = {
  totalCount: number;
  rows: (ImportedStructuredRow & ImportedStructuredRowMetadata)[];
};

export type SpreadsheetImportServerRowEdit = {
  rowNumber: number;
  values?: Record<string, string | boolean | null>;
  isDeleted?: boolean;
};

// Lets the dialog run parsing, validation and writes on the server. The
// browser then only holds previews, samples and one page of rows.
export type SpreadsheetImportServerAdapter = {
  uploadFile: (
    file: File,
  ) => Promise<{ sheetNames: string[]; rows: ImportedRow[] }>;
  previewSheet: (sheetName: string) => Promise<ImportedRow[]>;
  // Returns the header and rows standing in for the file in column matching:
  // example rows first, then every distinct value of each column
  prepareRows: (args: {
    sheetName?: string;
    headerRowIndex: number;
  }) => Promise<{
    headerValues: ImportedRow;
    data: ImportedRow[];
    rowCount: number;
  }>;
  validateRows: (
    columns: SpreadsheetColumns,
  ) => Promise<{ rowCount: number; errorRowCount: number }>;
  loadRows: (args: {
    offset: number;
    limit: number;
    onlyErrors: boolean;
  }) => Promise<SpreadsheetImportServerRowsPage>;
  // Queues edits made in the review grid and saves every edit not saved
  // yet, in order; resolves once all rows have been checked again. Edits the
  // server rejects are dropped and reported. Call it with no edits to retry
  // after a failure.
  saveEdits: (edits: SpreadsheetImportServerRowEdit[]) => Promise<{
    rowCount: number;
    errorRowCount: number;
    rejectedEditsErrorMessage?: string;
  }>;
  getUnsavedEdits: () => SpreadsheetImportServerRowEdit[];
  importRows: () => Promise<void>;
  cancelImport: () => Promise<void>;
  // Called when the dialog closes: a running import keeps going
  close: () => void;
};
