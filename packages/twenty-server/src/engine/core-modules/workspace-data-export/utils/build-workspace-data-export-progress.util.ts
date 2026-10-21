import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';

export type WorkspaceDataExportProgress = {
  objectCount: number;
  exportedObjectCount: number;
  columnCount: number;
  exportedRowCount: number;
};

export const buildWorkspaceDataExportProgress = (
  state: WorkspaceDataExportState,
): WorkspaceDataExportProgress => ({
  objectCount: state.tables.length,
  exportedObjectCount: state.completedTableCount,
  columnCount: state.tables.reduce(
    (total, table) => total + table.columns.length,
    0,
  ),
  exportedRowCount: Object.values(state.rowCountByPart).reduce(
    (total, rowCount) => total + rowCount,
    0,
  ),
});
