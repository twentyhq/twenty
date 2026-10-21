import { type WorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-cursor.type';

export const buildNextWorkspaceDataExportCursor = ({
  cursor,
  lastId,
  isTableExhausted,
}: {
  cursor: WorkspaceDataExportCursor;
  lastId: string | null;
  isTableExhausted: boolean;
}): WorkspaceDataExportCursor =>
  isTableExhausted
    ? {
        tableIndex: cursor.tableIndex + 1,
        lastId: null,
        partIndex: 0,
        stepIndex: cursor.stepIndex + 1,
        attempt: 0,
      }
    : {
        tableIndex: cursor.tableIndex,
        lastId,
        partIndex: cursor.partIndex + 1,
        stepIndex: cursor.stepIndex + 1,
        attempt: 0,
      };
