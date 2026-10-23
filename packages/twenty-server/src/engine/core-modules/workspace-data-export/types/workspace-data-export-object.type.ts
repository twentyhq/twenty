import { type RecordExportColumn } from 'twenty-shared/types';

export type WorkspaceDataExportObject = {
  objectMetadataId: string;
  nameSingular: string;
  labelSingular: string;
  columns: RecordExportColumn[];
  fieldCount: number;
};
