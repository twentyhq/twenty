export type WorkspaceDataExportCursor = {
  tableIndex: number;
  after: string | null;
  partIndex: number;
  stepIndex: number;
  attempt: number;
};
