import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCanChangePassword = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const hasBypassPermission = useHasPermissionFlag(
    PermissionFlagType.SSO_BYPASS,
  );

  const isPasswordAuthEnabled =
    currentWorkspace?.isPasswordAuthEnabled === true;

  if (isPasswordAuthEnabled) {
    return { canChangePassword: true };
  }

  if (!hasBypassPermission) {
    return { canChangePassword: false };
  }

  const canChangePassword =
    currentWorkspace?.isPasswordAuthBypassEnabled === true;

  return { canChangePassword };
};
