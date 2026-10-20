import { registerEnumType } from '@nestjs/graphql';

export enum WorkspaceDataExportStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

registerEnumType(WorkspaceDataExportStatus, {
  name: 'WorkspaceDataExportStatus',
});
