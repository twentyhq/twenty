import { isNonEmptyString } from '@sniptt/guards';

import { type AdminApplicationMonitoringWorkspace } from '@/settings/admin-panel/apps/types/AdminApplicationMonitoringWorkspace';

export const getAdminApplicationMonitoringWorkspaceLabel = ({
  workspaceId,
  workspaceName,
}: AdminApplicationMonitoringWorkspace): string =>
  isNonEmptyString(workspaceName) ? workspaceName : workspaceId;
