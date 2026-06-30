import { t } from '@lingui/core/macro';

import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';

type ApplicationLike = {
  name: string;
  id?: string | null;
  universalIdentifier?: string | null;
};

type WorkspaceLike = {
  workspaceCustomApplication?: { id?: string | null } | null;
};

// The standard and workspace-custom apps are shown by their role rather than
// their raw name; every other installed app keeps its own name.
export const getApplicationDisplayName = (
  application: ApplicationLike,
  currentWorkspace: WorkspaceLike | null | undefined,
): string => {
  if (isTwentyStandardApplication(application)) {
    return t`Standard`;
  }

  if (isWorkspaceCustomApplication(application, currentWorkspace)) {
    return t`Custom`;
  }

  return application.name;
};
