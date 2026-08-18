import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { isWorkspaceDeletionPending } from 'src/engine/core-modules/workspace/utils/is-workspace-deletion-pending.util';

type WorkspaceDeletionState = Pick<
  WorkspaceEntity,
  'deletedAt' | 'applicationUninstallHooksCompletedAt'
>;

export const isWorkspaceDeletionRequestPending = ({
  workspace,
  workspaceDeletionRequestTimestamp,
}: {
  workspace: WorkspaceDeletionState | null | undefined;
  workspaceDeletionRequestTimestamp: string;
}): workspace is WorkspaceDeletionState & { deletedAt: Date } =>
  isWorkspaceDeletionPending(workspace) &&
  workspace.deletedAt.toISOString() === workspaceDeletionRequestTimestamp;
