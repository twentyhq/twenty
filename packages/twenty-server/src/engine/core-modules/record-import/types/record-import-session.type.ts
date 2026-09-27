import { type APP_LOCALES } from 'twenty-shared/translations';
import { type FieldMetadataType } from 'twenty-shared/types';
import { type SpreadsheetColumns } from 'twenty-shared/utils';

export type RecordImportFileType = 'csv' | 'xlsx' | 'xls';

export type RecordImportStatus =
  | 'UPLOADED'
  | 'PREPARING'
  | 'READY'
  | 'IMPORTING'
  | 'CANCELLING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

// What a column was matched to when the mapping was saved, re-checked
// against live metadata when the import starts (DATA-6).
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
  columns?: SpreadsheetColumns;
  mappedFields?: RecordImportMappedField[];
  jobId?: string;
  result?: RecordImportResult;
  reportFileId?: string;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
};

export type RecordImportRow = {
  // 1-based row number as a spreadsheet application shows it (DATA-8)
  rowNumber: number;
  cells: string[];
};

export type RecordImportColumnSamples = {
  headerValues: string[];
  exampleRows: string[][];
  distinctValuesByColumn: string[][];
};

export type RecordImportJobProgress = {
  processedRowCount: number;
  totalRowCount: number;
  importedRecordCount?: number;
  skippedRowCount?: number;
  failedRowCount?: number;
};
