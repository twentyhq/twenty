import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type PermissionsService } from 'src/engine/permissions/permissions.service';

// A workspace being created has no roles to check settings permissions against yet
const WORKSPACE_ACTIVATION_STATUSES_WITHOUT_ROLES = [
  WorkspaceActivationStatus.PENDING_CREATION,
  WorkspaceActivationStatus.ONGOING_CREATION,
];

export const isSettingsPermissionGranted = async ({
  permissionsService,
  request,
  permissionFlag,
}: {
  permissionsService: PermissionsService;
  request: Pick<
    Request,
    'workspace' | 'userWorkspaceId' | 'apiKey' | 'application' | 'agentId'
  >;
  permissionFlag: PermissionFlagType;
}): Promise<boolean> => {
  const { workspace } = request;

  if (!isDefined(workspace)) {
    return false;
  }

  if (
    WORKSPACE_ACTIVATION_STATUSES_WITHOUT_ROLES.includes(
      workspace.activationStatus,
    )
  ) {
    return true;
  }

  return permissionsService.userHasWorkspaceSettingPermission({
    userWorkspaceId: request.userWorkspaceId,
    setting: permissionFlag,
    workspaceId: workspace.id,
    apiKeyId: request.apiKey?.id,
    applicationId: request.application?.id,
    agentId: request.agentId,
  });
};
