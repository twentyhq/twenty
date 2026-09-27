import { type SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { type ImportedRow } from '@/spreadsheet-import/types';
import { type SpreadsheetColumns } from 'twenty-shared/utils';
import { type WorkBook } from 'xlsx-ugnis';

export type SpreadsheetImportStep =
  | {
      type: SpreadsheetImportStepType.upload;
    }
  | {
      type: SpreadsheetImportStepType.selectSheet;
      sheetNames: string[];
      // Absent when the server parses the file
      workbook?: WorkBook;
    }
  | {
      type: SpreadsheetImportStepType.selectHeader;
      data: ImportedRow[];
      sheetName?: string;
    }
  | {
      type: SpreadsheetImportStepType.matchColumns;
      data: ImportedRow[];
      headerValues: ImportedRow;
      // Rows in the whole file when the server holds it, as data is a sample
      rowCount?: number;
    }
  | {
      type: SpreadsheetImportStepType.validateData;
      data: any[];
      importedColumns: SpreadsheetColumns;
    }
  | {
      type: SpreadsheetImportStepType.loading;
    }
  | {
      type: SpreadsheetImportStepType.importData;
      recordsToImportCount: number;
    };
