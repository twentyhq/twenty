import { type WorkspaceDataExportTable } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-table.type';

export type WorkspaceDataExportState = {
  workspaceName: string;
  tables: WorkspaceDataExportTable[];
  partNamesByTable: Record<string, string[]>;
  rowCountByPart: Record<string, number>;
  completedTableCount: number;
  startedAt: number;
  heartbeatAt: number;
};
