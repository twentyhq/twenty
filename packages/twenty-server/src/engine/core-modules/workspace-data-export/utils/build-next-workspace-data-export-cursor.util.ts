import { type WorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-cursor.type';

export const buildNextWorkspaceDataExportCursor = ({
  cursor,
  lastId,
  isTableExhausted,
}: {
  cursor: Pick<
    WorkspaceDataExportCursor,
    'tableIndex' | 'partIndex' | 'stepIndex'
  >;
  lastId: string | null;
  isTableExhausted: boolean;
}): WorkspaceDataExportCursor => {
  if (isTableExhausted) {
    return {
      tableIndex: cursor.tableIndex + 1,
      lastId: null,
      partIndex: 0,
      stepIndex: cursor.stepIndex + 1,
      attempt: 0,
    };
  }

  return {
    tableIndex: cursor.tableIndex,
    lastId,
    partIndex: cursor.partIndex + 1,
    stepIndex: cursor.stepIndex + 1,
    attempt: 0,
  };
};
