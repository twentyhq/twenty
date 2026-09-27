import { type ImportedRow } from '@/spreadsheet-import/types/SpreadsheetImportImportedRow';
import { type SpreadsheetColumns } from 'twenty-shared/utils';

// Lets the dialog run parsing, validation and writes on the server. The
// browser then only holds previews and samples, never the whole file.
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
  importRows: (columns: SpreadsheetColumns) => Promise<void>;
  cancelImport: () => Promise<void>;
  // Called when the dialog closes: a running import keeps going
  close: () => void;
};
