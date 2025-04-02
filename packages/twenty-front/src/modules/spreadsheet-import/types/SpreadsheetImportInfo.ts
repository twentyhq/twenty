import { SpreadsheetImportErrorLevel } from './SpreadsheetImportErrorLevel';

export type SpreadsheetImportInfo = {
  message: string;
  level: SpreadsheetImportErrorLevel;
};
