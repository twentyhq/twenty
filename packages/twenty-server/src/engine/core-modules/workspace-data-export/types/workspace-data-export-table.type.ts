import { type RecordExportColumn } from 'src/engine/core-modules/record-export/types/record-export-column.type';

export type WorkspaceDataExportTable = {
  objectMetadataId: string;
  nameSingular: string;
  labelSingular: string;
  columns: RecordExportColumn[];
  fieldCount: number;
};
