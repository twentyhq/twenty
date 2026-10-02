import { type PermissionFlagType } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

export const hasSettingsPermission = async ({
  permissionsService,
  workspace,
  authContext: { userWorkspaceId, apiKey, application },
  setting,
}: {
  permissionsService: PermissionsService;
  workspace: Pick<FlatWorkspace, 'id' | 'activationStatus'>;
  authContext: Pick<
    RawAuthContext,
    'userWorkspaceId' | 'apiKey' | 'application'
  >;
  setting: PermissionFlagType;
}): Promise<boolean> => {
  if (
    [
      WorkspaceActivationStatus.PENDING_CREATION,
      WorkspaceActivationStatus.ONGOING_CREATION,
    ].includes(workspace.activationStatus)
  ) {
    return true;
  }

  return permissionsService.userHasWorkspaceSettingPermission({
    userWorkspaceId,
    setting,
    workspaceId: workspace.id,
    apiKeyId: apiKey?.id,
    applicationId: application?.id,
  });
};
