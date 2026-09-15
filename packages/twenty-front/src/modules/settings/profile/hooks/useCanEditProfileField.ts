import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { countAvailableWorkspaces } from '@/auth/utils/availableWorkspacesUtils';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export type EditableProfileField =
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'profilePicture';

export const useCanEditProfileField = (field: EditableProfileField) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
  const availableWorkspaces = useAtomStateValue(availableWorkspacesState);

  if (!currentWorkspace || !currentUserWorkspace) {
    return {
      canEdit: false,
      isBlockedByWorkspaceLimit: false,
    };
  }

  const editableFields = currentWorkspace.editableProfileFields ?? [];
  const workspaceAllowsField = editableFields.includes(field);

  const permissionFlags = currentUserWorkspace.permissionFlags ?? [];
  const hasProfilePermission = permissionFlags.includes(
    PermissionFlagType.PROFILE_INFORMATION,
  );

  const requiresSingleWorkspace = field === 'email';
  const isSingleWorkspaceUser =
    countAvailableWorkspaces(availableWorkspaces) <= 1;
  const isBlockedByWorkspaceLimit =
    requiresSingleWorkspace && !isSingleWorkspaceUser;

  return {
    canEdit:
      workspaceAllowsField &&
      hasProfilePermission &&
      !isBlockedByWorkspaceLimit,
    isBlockedByWorkspaceLimit,
  };
};
