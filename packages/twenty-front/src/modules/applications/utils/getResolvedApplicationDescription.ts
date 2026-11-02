import { getCustomApplicationDescription } from '@/applications/utils/getCustomApplicationDescription';
import { getStandardApplicationDescription } from '@/applications/utils/getStandardApplicationDescription';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';

type ApplicationLike = {
  id?: string | null;
  universalIdentifier?: string | null;
  description?: string | null;
};

type WorkspaceLike = {
  workspaceCustomApplication?: { id?: string | null } | null;
};

export const getResolvedApplicationDescription = ({
  application,
  currentWorkspace,
}: {
  application: ApplicationLike | null | undefined;
  currentWorkspace: WorkspaceLike | null | undefined;
}): string => {
  if (isTwentyStandardApplication(application)) {
    return getStandardApplicationDescription();
  }

  if (isWorkspaceCustomApplication(application, currentWorkspace)) {
    return getCustomApplicationDescription();
  }

  return application?.description ?? '';
};
