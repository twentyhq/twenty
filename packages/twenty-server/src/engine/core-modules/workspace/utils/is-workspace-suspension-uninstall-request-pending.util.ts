import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type WorkspaceSuspensionUninstallState = Pick<
  WorkspaceEntity,
  'activationStatus' | 'deletedAt' | 'suspendedAt'
>;

export const isWorkspaceSuspensionUninstallRequestPending = (
  workspace: WorkspaceSuspensionUninstallState | null | undefined,
  workspaceSuspensionUninstallRequestedAt: string,
): workspace is WorkspaceSuspensionUninstallState & {
  suspendedAt: Date;
} =>
  isDefined(workspace) &&
  workspace.activationStatus === WorkspaceActivationStatus.SUSPENDED &&
  !isDefined(workspace.deletedAt) &&
  isDefined(workspace.suspendedAt) &&
  workspace.suspendedAt.toISOString() ===
    workspaceSuspensionUninstallRequestedAt;
