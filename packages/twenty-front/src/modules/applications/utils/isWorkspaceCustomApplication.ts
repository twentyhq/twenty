import { isDefined } from 'twenty-shared/utils';

type ApplicationLike = {
  id?: string | null;
};

type WorkspaceLike = {
  workspaceCustomApplication?: { id?: string | null } | null;
};

export const isWorkspaceCustomApplication = (
  application: ApplicationLike | null | undefined,
  currentWorkspace: WorkspaceLike | null | undefined,
): boolean =>
  isDefined(application?.id) &&
  isDefined(currentWorkspace?.workspaceCustomApplication?.id) &&
  currentWorkspace.workspaceCustomApplication.id === application.id;
