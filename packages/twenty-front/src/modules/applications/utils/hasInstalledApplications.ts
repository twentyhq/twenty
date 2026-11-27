import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';

export const hasInstalledApplications = (
  workspace: CurrentWorkspace | null,
  applicationIds: string[],
) =>
  applicationIds.every((id) =>
    workspace?.installedApplications.some(
      (application) => application.id === id,
    ),
  );
