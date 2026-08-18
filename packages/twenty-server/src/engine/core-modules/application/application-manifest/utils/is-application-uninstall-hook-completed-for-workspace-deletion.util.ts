import { isDefined } from 'twenty-shared/utils';

export const isApplicationUninstallHookCompletedForWorkspaceDeletion = ({
  workspaceDeletionUninstallHookCompletedForDeletedAt,
  workspaceDeletedAt,
}: {
  workspaceDeletionUninstallHookCompletedForDeletedAt: Date | null;
  workspaceDeletedAt: Date;
}) =>
  isDefined(workspaceDeletionUninstallHookCompletedForDeletedAt) &&
  workspaceDeletionUninstallHookCompletedForDeletedAt.getTime() ===
    workspaceDeletedAt.getTime();
