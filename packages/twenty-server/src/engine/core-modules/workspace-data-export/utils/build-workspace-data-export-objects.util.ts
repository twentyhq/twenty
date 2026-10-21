import { type WorkspaceDataExportObjectDTO } from 'src/engine/core-modules/workspace-data-export/dtos/workspace-data-export-object.dto';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';

export const buildWorkspaceDataExportObjects = (
  state: Pick<
    WorkspaceDataExportState,
    'tables' | 'partsByTable' | 'completedTableCount'
  >,
): WorkspaceDataExportObjectDTO[] =>
  state.tables.map((table, tableIndex) => ({
    nameSingular: table.nameSingular,
    labelSingular: table.labelSingular,
    fieldCount: table.fieldCount,
    recordCount: state.partsByTable[table.nameSingular].reduce(
      (total, part) => total + part.recordCount,
      0,
    ),
    isExported: tableIndex < state.completedTableCount,
  }));
