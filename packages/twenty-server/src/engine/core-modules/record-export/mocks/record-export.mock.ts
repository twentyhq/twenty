import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';

export const getRecordExportMock = (
  overrides: Partial<RecordExport> = {},
): RecordExport => ({
  id: 'export',
  workspaceId: 'workspace',
  userWorkspaceId: 'owner',
  workspaceMemberId: 'member',
  parameters: { objectMetadataId: 'person', fieldMetadataIds: ['name'] },
  filename: 'person.csv',
  status: RecordExportStatus.QUEUED,
  processedRecordCount: 0,
  totalRecordCount: null,
  jobId: null,
  attemptId: null,
  filePath: null,
  errorMessage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  expiresAt: new Date(Date.now() + 3600_000),
  ...overrides,
});
