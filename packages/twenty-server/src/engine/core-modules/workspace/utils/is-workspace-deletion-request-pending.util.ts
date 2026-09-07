import {
  isWorkspaceDeletionPending,
  type WorkspaceDeletionState,
} from 'src/engine/core-modules/workspace/utils/is-workspace-deletion-pending.util';

export const isWorkspaceDeletionRequestPending = (
  workspace: WorkspaceDeletionState | null | undefined,
  workspaceDeletionRequestTimestamp: string,
): workspace is WorkspaceDeletionState & { deletedAt: Date } =>
  isWorkspaceDeletionPending(workspace) &&
  workspace.deletedAt.toISOString() === workspaceDeletionRequestTimestamp;
