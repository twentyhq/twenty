import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type WorkspaceDeletionState = Pick<
  WorkspaceEntity,
  'deletedAt' | 'applicationUninstallHooksCompletedAt'
>;

export const isWorkspaceDeletionPending = (
  workspace: WorkspaceDeletionState | null | undefined,
): workspace is WorkspaceDeletionState & { deletedAt: Date } =>
  isDefined(workspace) &&
  isDefined(workspace.deletedAt) &&
  !isDefined(workspace.applicationUninstallHooksCompletedAt);

export const isWorkspaceDeletionRequestPending = ({
  workspace,
  workspaceDeletionRequestTimestamp,
}: {
  workspace: WorkspaceDeletionState | null | undefined;
  workspaceDeletionRequestTimestamp: string;
}): workspace is WorkspaceDeletionState & { deletedAt: Date } =>
  isWorkspaceDeletionPending(workspace) &&
  workspace.deletedAt.toISOString() === workspaceDeletionRequestTimestamp;
