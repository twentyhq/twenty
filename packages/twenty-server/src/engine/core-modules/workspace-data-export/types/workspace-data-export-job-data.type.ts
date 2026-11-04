import { type WorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-cursor.type';

export type WorkspaceDataExportJobData = {
  workspaceId: string;
  exportId: string;
  cursor: WorkspaceDataExportCursor;
};
