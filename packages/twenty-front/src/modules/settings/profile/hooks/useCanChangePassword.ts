import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useCanChangePassword = () => {
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const currentUserWorkspace = useRecoilValueV2(currentUserWorkspaceState);

  const isPasswordAuthEnabled =
    currentWorkspace?.isPasswordAuthEnabled === true;

  if (isPasswordAuthEnabled) {
    return { canChangePassword: true };
  }

  const hasBypassPermission = currentUserWorkspace?.permissionFlags?.includes(
    PermissionFlagType.SSO_BYPASS,
  );

  if (!hasBypassPermission) {
    return { canChangePassword: false };
  }

  const canChangePassword =
    currentWorkspace?.isPasswordAuthBypassEnabled === true;

  return { canChangePassword };
};
