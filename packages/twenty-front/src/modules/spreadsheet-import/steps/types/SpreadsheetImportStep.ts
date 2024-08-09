import { Columns } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { ImportedRow } from '@/spreadsheet-import/types';
import { WorkBook } from 'xlsx-ugnis';

export type SpreadsheetImportStep =
  | {
      type: SpreadsheetImportStepType.upload;
    }
  | {
      type: SpreadsheetImportStepType.selectSheet;
      workbook: WorkBook;
    }
  | {
      type: SpreadsheetImportStepType.selectHeader;
      data: ImportedRow[];
    }
  | {
      type: SpreadsheetImportStepType.matchColumns;
      data: ImportedRow[];
      headerValues: ImportedRow;
    }
  | {
      type: SpreadsheetImportStepType.validateData;
      data: any[];
      importedColumns: Columns<string>;
    }
  | {
      type: SpreadsheetImportStepType.loading;
    };
