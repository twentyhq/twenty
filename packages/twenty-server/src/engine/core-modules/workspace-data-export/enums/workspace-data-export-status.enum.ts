import { registerEnumType } from '@nestjs/graphql';

export enum WorkspaceDataExportStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(WorkspaceDataExportStatus, {
  name: 'WorkspaceDataExportStatus',
});
