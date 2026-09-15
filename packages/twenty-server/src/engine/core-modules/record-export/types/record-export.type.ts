import { type RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';

export type RecordExport = {
  id: string;
  workspaceId: string;
  userWorkspaceId: string;
  workspaceMemberId: string;
  parameters: RecordExportParameters;
  filename: string;
  status: RecordExportStatus;
  processedRecordCount: number;
  totalRecordCount: number | null;
  jobId: string | null;
  attemptId: string | null;
  filePath: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
};
