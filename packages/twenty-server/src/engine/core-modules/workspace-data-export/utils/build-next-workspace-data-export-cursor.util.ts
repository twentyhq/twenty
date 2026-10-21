import { type WorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-cursor.type';

export const buildNextWorkspaceDataExportCursor = ({
  cursor,
  after,
  isTableExhausted,
}: {
  cursor: Pick<
    WorkspaceDataExportCursor,
    'tableIndex' | 'partIndex' | 'stepIndex'
  >;
  after: string | null;
  isTableExhausted: boolean;
}): WorkspaceDataExportCursor => {
  if (isTableExhausted) {
    return {
      tableIndex: cursor.tableIndex + 1,
      after: null,
      partIndex: 0,
      stepIndex: cursor.stepIndex + 1,
      attempt: 0,
    };
  }

  return {
    tableIndex: cursor.tableIndex,
    after,
    partIndex: cursor.partIndex + 1,
    stepIndex: cursor.stepIndex + 1,
    attempt: 0,
  };
};
