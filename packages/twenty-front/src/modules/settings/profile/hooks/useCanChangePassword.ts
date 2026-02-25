import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCanChangePassword = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);

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
