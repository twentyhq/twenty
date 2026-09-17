import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';

export type RecordExport = {
  id: string;
  workspaceId: string;
  userWorkspaceId: string;
  workspaceMemberId: string;
  parameters: RecordExportParameters;
  filename: string;
  createdAt: number;
};

export type RecordExportProgress = {
  processedRecordCount: number;
  totalRecordCount: number | null;
  errorMessage?: string;
};

export type RecordExportResult = RecordExportProgress & {
  fileId: string;
};

export type RecordExportDownload = RecordExport &
  RecordExportResult & {
    expiresAt: number;
  };
