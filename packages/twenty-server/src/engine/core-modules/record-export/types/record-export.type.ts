import { type RecordExportSession } from 'src/engine/core-modules/record-export/types/record-export-session.type';
import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';

export type RecordExport = RecordExportSession & {
  id: string;
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
