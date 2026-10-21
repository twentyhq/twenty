import { type WorkspaceDataExportColumn } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-column.type';

export type WorkspaceDataExportTable = {
  nameSingular: string;
  labelSingular: string;
  tableName: string;
  fieldCount: number;
  columns: WorkspaceDataExportColumn[];
};
