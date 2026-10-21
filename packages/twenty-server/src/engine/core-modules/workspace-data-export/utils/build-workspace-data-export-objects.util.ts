import { type WorkspaceDataExportObjectDTO } from 'src/engine/core-modules/workspace-data-export/dtos/workspace-data-export-object.dto';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';

export const buildWorkspaceDataExportObjects = (
  state: Pick<
    WorkspaceDataExportState,
    'tables' | 'partNamesByTable' | 'rowCountByPart' | 'completedTableCount'
  >,
): WorkspaceDataExportObjectDTO[] =>
  state.tables.map((table, tableIndex) => ({
    nameSingular: table.nameSingular,
    labelSingular: table.labelSingular,
    columnCount: table.columns.length,
    rowCount: (state.partNamesByTable[table.nameSingular] ?? []).reduce(
      (total, partName) => total + (state.rowCountByPart[partName] ?? 0),
      0,
    ),
    isExported: tableIndex < state.completedTableCount,
  }));
