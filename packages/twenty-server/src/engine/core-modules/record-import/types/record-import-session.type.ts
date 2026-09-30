import { type APP_LOCALES } from 'twenty-shared/translations';
import { type FieldMetadataType } from 'twenty-shared/types';
import { type SpreadsheetColumns } from 'twenty-shared/utils';

export type RecordImportFileType = 'csv' | 'xlsx' | 'xls';

export type RecordImportStatus =
  | 'UPLOADED'
  | 'PREPARING'
  | 'READY'
  | 'VALIDATING'
  | 'VALIDATED'
  | 'IMPORTING'
  | 'CANCELLING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

// What a column was matched to when the mapping was saved, re-checked
// against live metadata when the import starts.
export type RecordImportMappedField = {
  key: string;
  fieldMetadataId: string;
  fieldMetadataType: FieldMetadataType;
  optionValues?: string[];
};

export type RecordImportResult = {
  totalRowCount: number;
  processedRowCount: number;
  importedRecordCount: number;
  skippedRowCount: number;
  failedRowCount: number;
};

export type RecordImportSession = {
  id: string;
  version: number;
  status: RecordImportStatus;
  workspaceId: string;
  userWorkspaceId: string;
  workspaceMemberId: string;
  // Renders messages the job stores for the requester
  locale: keyof typeof APP_LOCALES;
  objectMetadataId: string;
  timeZone: string;
  fileName: string;
  fileType: RecordImportFileType;
  // The upload lives in the workspace custom application's storage
  sourceApplicationUniversalIdentifier: string;
  sourceResourcePath: string;
  sheetNames: string[];
  sheetName?: string;
  headerRowIndex?: number;
  headerValues?: string[];
  rowCount?: number;
  chunkCount?: number;
  // Row number of the first row of each chunk, to find a row's chunk
  chunkFirstRowNumbers?: number[];
  deletedRowCount?: number;
  columns?: SpreadsheetColumns;
  mappedFields?: RecordImportMappedField[];
  // Identifies the validation of the current mapping; a validation job that
  // finishes after the mapping changed is discarded
  validationRunId?: string;
  errorRowCount?: number;
  jobId?: string;
  result?: RecordImportResult;
  reportFileId?: string;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
};

export type RecordImportRow = {
  // 1-based row number as a spreadsheet application shows it
  rowNumber: number;
  cells: string[];
};

export type RecordImportColumnSamples = {
  headerValues: string[];
  exampleRows: string[][];
  distinctValuesByColumn: string[][];
};

// A change the user made in the review grid, kept apart from the stored
// rows and applied over them whenever rows are read
export type RecordImportRowEdit = {
  rowNumber: number;
  position: number;
  isDeleted: boolean;
  // Values by field key, as the grid shows them
  values: Record<string, string | boolean | null>;
};

// Rows with any error or warning, in file order, split into pages of
// RECORD_IMPORT_ERROR_ROWS_PER_PAGE so the error filter never reads rows
// without errors
export type RecordImportErrorIndex = {
  rowCount: number;
  pageCount: number;
};

export type RecordImportErrorRow<TRowErrors> = RecordImportRow & {
  errors: TRowErrors;
};

export type RecordImportJobProgress = {
  processedRowCount: number;
  totalRowCount: number;
  importedRecordCount?: number;
  skippedRowCount?: number;
  failedRowCount?: number;
};
