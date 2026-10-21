import { type WorkspaceDataExportTable } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-table.type';

export type WorkspaceDataExportStatePart = {
  name: string;
  recordCount: number;
};

export type WorkspaceDataExportState = {
  workspaceName: string;
  tables: WorkspaceDataExportTable[];
  partsByTable: Record<string, WorkspaceDataExportStatePart[]>;
  completedTableCount: number;
  startedAt: number;
  heartbeatAt: number;
};
