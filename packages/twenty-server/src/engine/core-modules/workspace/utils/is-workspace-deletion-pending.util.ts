import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export type WorkspaceDeletionState = Pick<WorkspaceEntity, 'deletedAt'>;

export const isWorkspaceDeletionPending = (
  workspace: WorkspaceDeletionState | null | undefined,
): workspace is WorkspaceDeletionState & { deletedAt: Date } =>
  isDefined(workspace) && isDefined(workspace.deletedAt);
