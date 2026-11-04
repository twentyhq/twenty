import { type WorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-cursor.type';

export const buildNextWorkspaceDataExportCursor = ({
  cursor,
  after,
  isLastPart,
}: {
  cursor: Pick<
    WorkspaceDataExportCursor,
    'objectIndex' | 'partIndex' | 'stepIndex'
  >;
  after: string | null;
  isLastPart: boolean;
}): WorkspaceDataExportCursor => {
  if (isLastPart) {
    return {
      objectIndex: cursor.objectIndex + 1,
      after: null,
      partIndex: 0,
      stepIndex: cursor.stepIndex + 1,
      attempt: 0,
    };
  }

  return {
    objectIndex: cursor.objectIndex,
    after,
    partIndex: cursor.partIndex + 1,
    stepIndex: cursor.stepIndex + 1,
    attempt: 0,
  };
};
