import { type RecordExportRequester } from 'src/engine/core-modules/record-export/types/record-export-requester.type';
import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';

export type RecordExport = RecordExportRequester & {
  id: string;
  requestTokenHash: string;
  permissionsHash: string;
  parameters: RecordExportParameters;
  filename: string;
  createdAt: number;
};

export type RecordExportProgress = {
  processedRecordCount: number;
  totalRecordCount: number | null;
  errorMessage?: string;
};
