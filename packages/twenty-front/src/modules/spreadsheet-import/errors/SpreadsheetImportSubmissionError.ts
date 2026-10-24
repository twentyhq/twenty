import { doNotTranslate } from 'twenty-shared/i18n';

export class SpreadsheetImportSubmissionError extends Error {
  readonly importedRowCount: number;

  constructor(cause: unknown, importedRowCount: number) {
    super(doNotTranslate('Spreadsheet import failed'), { cause });
    this.importedRowCount = importedRowCount;
  }
}
